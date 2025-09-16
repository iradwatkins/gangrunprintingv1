import { prisma } from '@/lib/prisma'
import {
  type MarketingWorkflow,
  type WorkflowExecution,
  ExecutionStatus,
  CampaignType,
  SendStatus
} from '@prisma/client'
import { CampaignService } from './campaign-service'

export interface WorkflowTrigger {
  type: 'event' | 'schedule' | 'condition'
  event?: string // 'order_placed', 'user_registered', 'email_opened', etc.
  schedule?: {
    type: 'immediate' | 'delay' | 'recurring'
    delay?: number // minutes
    recurringPattern?: string // cron expression
  }
  condition?: {
    field: string
    operator: string
    value: any
  }
}

export interface WorkflowStep {
  id: string
  type: 'email' | 'sms' | 'wait' | 'condition' | 'webhook' | 'tag' | 'update_user'
  name: string
  settings: any
  nextStep?: string
  conditionSteps?: {
    true: string
    false: string
  }
}

export interface WorkflowEmailStep {
  templateId?: string
  subject: string
  content: any
  senderName?: string
  senderEmail?: string
}

export interface WorkflowSMSStep {
  message: string
}

export interface WorkflowWaitStep {
  duration: number // minutes
  waitUntil?: Date
}

export interface WorkflowConditionStep {
  condition: {
    field: string
    operator: string
    value: any
  }
}

export interface WorkflowWebhookStep {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  payload?: any
}

export interface WorkflowTagStep {
  action: 'add' | 'remove'
  tags: string[]
}

export interface WorkflowUpdateUserStep {
  updates: Record<string, any>
}

export class WorkflowEngine {
  static async createWorkflow(
    name: string,
    description: string | null,
    trigger: WorkflowTrigger,
    steps: WorkflowStep[],
    segmentId?: string,
    settings?: any
  ): Promise<MarketingWorkflow> {
    return await prisma.marketingWorkflow.create({
      data: {
        name,
        description,
        trigger,
        steps,
        segmentId,
        settings,
        isActive: false, // Start inactive
      },
    })
  }

  static async updateWorkflow(
    id: string,
    data: {
      name?: string
      description?: string | null
      trigger?: WorkflowTrigger
      steps?: WorkflowStep[]
      segmentId?: string
      settings?: any
      isActive?: boolean
    }
  ): Promise<MarketingWorkflow> {
    return await prisma.marketingWorkflow.update({
      where: { id },
      data,
    })
  }

  static async getWorkflow(id: string): Promise<MarketingWorkflow | null> {
    return await prisma.marketingWorkflow.findUnique({
      where: { id },
      include: {
        segment: true,
        executions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    })
  }

  static async getWorkflows(): Promise<MarketingWorkflow[]> {
    return await prisma.marketingWorkflow.findMany({
      include: {
        segment: true,
        _count: {
          select: {
            executions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  static async deleteWorkflow(id: string): Promise<void> {
    await prisma.marketingWorkflow.delete({
      where: { id },
    })
  }

  static async activateWorkflow(id: string): Promise<MarketingWorkflow> {
    return await prisma.marketingWorkflow.update({
      where: { id },
      data: { isActive: true },
    })
  }

  static async deactivateWorkflow(id: string): Promise<MarketingWorkflow> {
    return await prisma.marketingWorkflow.update({
      where: { id },
      data: { isActive: false },
    })
  }

  static async triggerWorkflow(
    workflowId: string,
    userId: string,
    triggerData: any
  ): Promise<WorkflowExecution> {
    const workflow = await prisma.marketingWorkflow.findUnique({
      where: { id: workflowId },
    })

    if (!workflow || !workflow.isActive) {
      throw new Error('Workflow not found or inactive')
    }

    // Check if user is in the workflow's segment (if specified)
    if (workflow.segmentId) {
      const segment = await prisma.customerSegment.findUnique({
        where: { id: workflow.segmentId },
      })

      if (!segment || !segment.customerIds.includes(userId)) {
        throw new Error('User not in workflow segment')
      }
    }

    const execution = await prisma.workflowExecution.create({
      data: {
        workflowId,
        userId,
        triggerData,
        status: ExecutionStatus.RUNNING,
        currentStep: 0,
      },
    })

    // Start execution asynchronously
    this.executeWorkflow(execution.id).catch(error => {
      console.error('Workflow execution error:', error)
    })

    return execution
  }

  static async executeWorkflow(executionId: string): Promise<void> {
    const execution = await prisma.workflowExecution.findUnique({
      where: { id: executionId },
      include: {
        workflow: true,
        user: true,
      },
    })

    if (!execution || execution.status !== ExecutionStatus.RUNNING) {
      return
    }

    const { workflow, user } = execution
    const steps = workflow.steps as WorkflowStep[]

    if (!steps || steps.length === 0) {
      await this.completeExecution(executionId, 'No steps to execute')
      return
    }

    try {
      let currentStepIndex = execution.currentStep
      const stepResults = execution.stepResults as any[] || []

      while (currentStepIndex < steps.length) {
        const step = steps[currentStepIndex]
        const result = await this.executeStep(step, execution, user)

        stepResults.push({
          stepId: step.id,
          result,
          executedAt: new Date(),
        })

        // Update execution progress
        await prisma.workflowExecution.update({
          where: { id: executionId },
          data: {
            currentStep: currentStepIndex + 1,
            stepResults,
          },
        })

        // Handle step result
        if (result.nextStep) {
          currentStepIndex = steps.findIndex(s => s.id === result.nextStep)
          if (currentStepIndex === -1) break
        } else if (result.wait) {
          // Schedule continuation
          await this.scheduleWorkflowContinuation(executionId, result.waitUntil)
          return
        } else {
          currentStepIndex++
        }
      }

      await this.completeExecution(executionId, 'Workflow completed successfully')
    } catch (error) {
      await this.failExecution(executionId, error instanceof Error ? error.message : 'Unknown error')
    }
  }

  private static async executeStep(
    step: WorkflowStep,
    execution: WorkflowExecution,
    user: any
  ): Promise<any> {
    switch (step.type) {
      case 'email':
        return await this.executeEmailStep(step, execution, user)
      case 'sms':
        return await this.executeSMSStep(step, execution, user)
      case 'wait':
        return await this.executeWaitStep(step, execution)
      case 'condition':
        return await this.executeConditionStep(step, execution, user)
      case 'webhook':
        return await this.executeWebhookStep(step, execution, user)
      case 'tag':
        return await this.executeTagStep(step, execution, user)
      case 'update_user':
        return await this.executeUpdateUserStep(step, execution, user)
      default:
        throw new Error(`Unknown step type: ${step.type}`)
    }
  }

  private static async executeEmailStep(
    step: WorkflowStep,
    execution: WorkflowExecution,
    user: any
  ): Promise<any> {
    const settings = step.settings as WorkflowEmailStep

    if (!user.marketingOptIn) {
      return { status: 'skipped', reason: 'User not opted in for marketing emails' }
    }

    // Create a campaign for this email
    const campaign = await CampaignService.createCampaign({
      name: `Workflow: ${execution.workflow.name} - ${step.name}`,
      type: CampaignType.EMAIL,
      subject: settings.subject,
      content: settings.content,
      senderName: settings.senderName,
      senderEmail: settings.senderEmail,
      createdBy: 'system',
    })

    // Create a send record
    await prisma.campaignSend.create({
      data: {
        campaignId: campaign.id,
        recipientEmail: user.email,
        recipientName: user.name,
        userId: user.id,
        status: SendStatus.SENT,
        sentAt: new Date(),
      },
    })

    return { status: 'sent', campaignId: campaign.id }
  }

  private static async executeSMSStep(
    step: WorkflowStep,
    execution: WorkflowExecution,
    user: any
  ): Promise<any> {
    const settings = step.settings as WorkflowSMSStep

    if (!user.smsOptIn || !user.phoneNumber) {
      return { status: 'skipped', reason: 'User not opted in for SMS or no phone number' }
    }

    // Create SMS campaign
    const smsCampaign = await prisma.sMSCampaign.create({
      data: {
        name: `Workflow: ${execution.workflow.name} - ${step.name}`,
        message: settings.message,
        createdBy: 'system',
      },
    })

    // Create SMS send
    await prisma.sMSSend.create({
      data: {
        campaignId: smsCampaign.id,
        phoneNumber: user.phoneNumber,
        userId: user.id,
        status: SendStatus.SENT,
        sentAt: new Date(),
      },
    })

    return { status: 'sent', smsCampaignId: smsCampaign.id }
  }

  private static async executeWaitStep(
    step: WorkflowStep,
    execution: WorkflowExecution
  ): Promise<any> {
    const settings = step.settings as WorkflowWaitStep

    let waitUntil: Date

    if (settings.waitUntil) {
      waitUntil = new Date(settings.waitUntil)
    } else {
      waitUntil = new Date(Date.now() + settings.duration * 60 * 1000)
    }

    return { wait: true, waitUntil }
  }

  private static async executeConditionStep(
    step: WorkflowStep,
    execution: WorkflowExecution,
    user: any
  ): Promise<any> {
    const settings = step.settings as WorkflowConditionStep
    const { condition } = settings

    let value: any

    // Get the value to check based on the field
    switch (condition.field) {
      case 'user.email':
        value = user.email
        break
      case 'user.name':
        value = user.name
        break
      case 'user.orderCount':
        const orderCount = await prisma.order.count({
          where: { userId: user.id },
        })
        value = orderCount
        break
      case 'user.totalSpent':
        const totalSpent = await prisma.order.aggregate({
          where: { userId: user.id },
          _sum: { total: true },
        })
        value = totalSpent._sum.total || 0
        break
      default:
        value = null
    }

    const conditionMet = this.evaluateCondition(value, condition.operator, condition.value)

    // Return next step based on condition
    if (step.conditionSteps) {
      return {
        nextStep: conditionMet ? step.conditionSteps.true : step.conditionSteps.false,
      }
    }

    return { status: 'evaluated', conditionMet }
  }

  private static async executeWebhookStep(
    step: WorkflowStep,
    execution: WorkflowExecution,
    user: any
  ): Promise<any> {
    const settings = step.settings as WorkflowWebhookStep

    try {
      const response = await fetch(settings.url, {
        method: settings.method,
        headers: {
          'Content-Type': 'application/json',
          ...settings.headers,
        },
        body: settings.payload ? JSON.stringify({
          ...settings.payload,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
          execution: {
            id: execution.id,
            workflowId: execution.workflowId,
            triggerData: execution.triggerData,
          },
        }) : undefined,
      })

      const responseData = await response.json()

      return {
        status: 'success',
        responseStatus: response.status,
        responseData,
      }
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private static async executeTagStep(
    step: WorkflowStep,
    execution: WorkflowExecution,
    user: any
  ): Promise<any> {
    const settings = step.settings as WorkflowTagStep

    // For now, we'll store tags in user metadata
    // In a real implementation, you might have a separate tags table
    const currentTags = (user.metadata?.tags as string[]) || []

    let newTags: string[]

    if (settings.action === 'add') {
      newTags = [...new Set([...currentTags, ...settings.tags])]
    } else {
      newTags = currentTags.filter(tag => !settings.tags.includes(tag))
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        // Note: This assumes you have a metadata field on the User model
        // You might need to adjust this based on your actual schema
      },
    })

    return {
      status: 'success',
      action: settings.action,
      tags: settings.tags,
      newTags,
    }
  }

  private static async executeUpdateUserStep(
    step: WorkflowStep,
    execution: WorkflowExecution,
    user: any
  ): Promise<any> {
    const settings = step.settings as WorkflowUpdateUserStep

    await prisma.user.update({
      where: { id: user.id },
      data: settings.updates,
    })

    return {
      status: 'success',
      updates: settings.updates,
    }
  }

  private static evaluateCondition(value: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'equals':
        return value === expected
      case 'not_equals':
        return value !== expected
      case 'greater_than':
        return value > expected
      case 'less_than':
        return value < expected
      case 'contains':
        return String(value).includes(String(expected))
      case 'starts_with':
        return String(value).startsWith(String(expected))
      case 'ends_with':
        return String(value).endsWith(String(expected))
      default:
        return false
    }
  }

  private static async completeExecution(executionId: string, message?: string): Promise<void> {
    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status: ExecutionStatus.COMPLETED,
        completedAt: new Date(),
        errorMessage: message,
      },
    })
  }

  private static async failExecution(executionId: string, error: string): Promise<void> {
    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status: ExecutionStatus.FAILED,
        completedAt: new Date(),
        errorMessage: error,
      },
    })
  }

  private static async scheduleWorkflowContinuation(
    executionId: string,
    waitUntil: Date
  ): Promise<void> {
    // In a real implementation, you would use a job queue like Bull, Agenda, or similar
    // For now, we'll just set a timeout (not recommended for production)
    const delay = waitUntil.getTime() - Date.now()

    if (delay > 0) {
      setTimeout(async () => {
        await this.executeWorkflow(executionId)
      }, delay)
    } else {
      // If the wait time has already passed, continue immediately
      await this.executeWorkflow(executionId)
    }
  }

  // Event handlers for triggering workflows
  static async handleEvent(event: string, data: any): Promise<void> {
    const workflows = await prisma.marketingWorkflow.findMany({
      where: {
        isActive: true,
        trigger: {
          path: ['type'],
          equals: 'event',
        },
      },
    })

    for (const workflow of workflows) {
      const trigger = workflow.trigger as WorkflowTrigger

      if (trigger.event === event) {
        const userId = data.userId
        if (userId) {
          await this.triggerWorkflow(workflow.id, userId, data)
        }
      }
    }
  }

  // Method to process scheduled workflows
  static async processScheduledWorkflows(): Promise<void> {
    const now = new Date()

    // Find workflows with schedule triggers
    const scheduledWorkflows = await prisma.marketingWorkflow.findMany({
      where: {
        isActive: true,
        trigger: {
          path: ['type'],
          equals: 'schedule',
        },
      },
    })

    for (const workflow of scheduledWorkflows) {
      const trigger = workflow.trigger as WorkflowTrigger

      if (trigger.schedule?.type === 'recurring') {
        // TODO: Implement cron-based scheduling
        // This would require a cron parser and scheduler
      }
    }

    // Continue paused executions that are ready
    const pausedExecutions = await prisma.workflowExecution.findMany({
      where: {
        status: ExecutionStatus.RUNNING,
        // Add condition to check if wait time has passed
      },
    })

    for (const execution of pausedExecutions) {
      await this.executeWorkflow(execution.id)
    }
  }

  // Predefined workflow templates
  static async createPredefinedWorkflows(): Promise<void> {
    const workflows = [
      {
        name: 'Welcome Series',
        description: 'Welcome new customers with a series of emails',
        trigger: {
          type: 'event' as const,
          event: 'user_registered',
        },
        steps: [
          {
            id: 'welcome_email',
            type: 'email' as const,
            name: 'Welcome Email',
            settings: {
              subject: 'Welcome to GangRun Printing!',
              content: {
                type: 'html',
                html: '<h1>Welcome!</h1><p>Thank you for joining GangRun Printing...</p>',
              },
            },
          },
          {
            id: 'wait_3_days',
            type: 'wait' as const,
            name: 'Wait 3 Days',
            settings: {
              duration: 3 * 24 * 60, // 3 days in minutes
            },
          },
          {
            id: 'onboarding_email',
            type: 'email' as const,
            name: 'Onboarding Tips',
            settings: {
              subject: 'Getting Started with Your First Order',
              content: {
                type: 'html',
                html: '<h1>Getting Started</h1><p>Here are some tips for your first order...</p>',
              },
            },
          },
        ],
      },
      {
        name: 'Abandoned Cart Recovery',
        description: 'Re-engage customers who abandoned their cart',
        trigger: {
          type: 'event' as const,
          event: 'cart_abandoned',
        },
        steps: [
          {
            id: 'wait_1_hour',
            type: 'wait' as const,
            name: 'Wait 1 Hour',
            settings: {
              duration: 60, // 1 hour
            },
          },
          {
            id: 'reminder_email',
            type: 'email' as const,
            name: 'Cart Reminder',
            settings: {
              subject: 'Complete your order at GangRun Printing',
              content: {
                type: 'html',
                html: '<h1>Complete Your Order</h1><p>You left some items in your cart...</p>',
              },
            },
          },
        ],
      },
      {
        name: 'Win-Back Campaign',
        description: 'Re-engage customers who haven\'t ordered recently',
        trigger: {
          type: 'condition' as const,
          condition: {
            field: 'user.daysSinceLastOrder',
            operator: 'greater_than',
            value: 90,
          },
        },
        steps: [
          {
            id: 'winback_email',
            type: 'email' as const,
            name: 'We Miss You',
            settings: {
              subject: 'We miss you! Come back for special savings',
              content: {
                type: 'html',
                html: '<h1>We Miss You!</h1><p>Here\'s a special offer to welcome you back...</p>',
              },
            },
          },
        ],
      },
    ]

    for (const workflowData of workflows) {
      try {
        await this.createWorkflow(
          workflowData.name,
          workflowData.description,
          workflowData.trigger,
          workflowData.steps
        )
      } catch (error) {
        console.log(`Workflow ${workflowData.name} may already exist`)
      }
    }
  }
}