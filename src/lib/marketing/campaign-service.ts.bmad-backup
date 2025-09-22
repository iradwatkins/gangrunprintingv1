import { prisma } from '@/lib/prisma'
import {
  type CampaignType,
  CampaignStatus,
  SendStatus,
  type MarketingCampaign,
  type CampaignSend,
  type CampaignAnalytics,
} from '@prisma/client'

export interface CampaignCreateData {
  name: string
  type: CampaignType
  subject?: string
  previewText?: string
  content: any
  senderName?: string
  senderEmail?: string
  replyToEmail?: string
  segmentId?: string
  scheduledAt?: Date
  isTemplate?: boolean
  templateName?: string
  tags?: string[]
  settings?: any
  createdBy: string
}

export interface CampaignUpdateData {
  name?: string
  subject?: string
  previewText?: string
  content?: any
  senderName?: string
  senderEmail?: string
  replyToEmail?: string
  segmentId?: string
  scheduledAt?: Date
  status?: CampaignStatus
  tags?: string[]
  settings?: any
}

export interface CampaignMetrics {
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  unsubscribed: number
  revenue: number
  orders: number
  deliveryRate: number
  openRate: number
  clickRate: number
  bounceRate: number
  unsubscribeRate: number
  clickToOpenRate: number
  revenuePerRecipient: number
}

export class CampaignService {
  static async createCampaign(data: CampaignCreateData): Promise<MarketingCampaign> {
    return await prisma.marketingCampaign.create({
      data: {
        ...data,
        utmCampaign: data.name.toLowerCase().replace(/\s+/g, '-'),
      },
      include: {
        segment: true,
      },
    })
  }

  static async updateCampaign(id: string, data: CampaignUpdateData): Promise<MarketingCampaign> {
    return await prisma.marketingCampaign.update({
      where: { id },
      data,
      include: {
        segment: true,
        analytics: true,
      },
    })
  }

  static async getCampaign(id: string): Promise<MarketingCampaign | null> {
    return await prisma.marketingCampaign.findUnique({
      where: { id },
      include: {
        segment: true,
        sends: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        analytics: {
          orderBy: { date: 'desc' },
          take: 30,
        },
        abTests: true,
      },
    })
  }

  static async getCampaigns(
    page = 1,
    limit = 20,
    filters: {
      status?: CampaignStatus
      type?: CampaignType
      search?: string
    } = {}
  ) {
    const offset = (page - 1) * limit
    const where: any = {}

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.type) {
      where.type = filters.type
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { subject: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    const [campaigns, total] = await Promise.all([
      prisma.marketingCampaign.findMany({
        where,
        include: {
          segment: true,
          _count: {
            select: {
              sends: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.marketingCampaign.count({ where }),
    ])

    return {
      campaigns,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  static async deleteCampaign(id: string): Promise<void> {
    await prisma.marketingCampaign.delete({
      where: { id },
    })
  }

  static async duplicateCampaign(id: string, name: string): Promise<MarketingCampaign> {
    const original = await prisma.marketingCampaign.findUnique({
      where: { id },
    })

    if (!original) {
      throw new Error('Campaign not found')
    }

    const { id: _, createdAt, updatedAt, sentAt, completedAt, ...campaignData } = original

    return await prisma.marketingCampaign.create({
      data: {
        ...campaignData,
        name,
        status: CampaignStatus.DRAFT,
        scheduledAt: null,
      },
    })
  }

  static async scheduleCampaign(id: string, scheduledAt: Date): Promise<MarketingCampaign> {
    return await prisma.marketingCampaign.update({
      where: { id },
      data: {
        status: CampaignStatus.SCHEDULED,
        scheduledAt,
      },
    })
  }

  static async sendCampaign(id: string): Promise<void> {
    const campaign = await prisma.marketingCampaign.findUnique({
      where: { id },
      include: {
        segment: true,
      },
    })

    if (!campaign) {
      throw new Error('Campaign not found')
    }

    if (campaign.status !== CampaignStatus.DRAFT && campaign.status !== CampaignStatus.SCHEDULED) {
      throw new Error('Campaign cannot be sent in current status')
    }

    // Update campaign status
    await prisma.marketingCampaign.update({
      where: { id },
      data: {
        status: CampaignStatus.SENDING,
        sentAt: new Date(),
      },
    })

    // Get recipients from segment or all marketing-opted-in users
    let recipients: { id: string; email: string; name: string | null }[] = []

    if (campaign.segment) {
      const customerIds = campaign.segment.customerIds
      recipients = await prisma.user.findMany({
        where: {
          id: { in: customerIds },
          marketingOptIn: true,
          emailVerified: true,
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      })
    } else {
      recipients = await prisma.user.findMany({
        where: {
          marketingOptIn: true,
          emailVerified: true,
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      })
    }

    // Create campaign sends
    const sends = recipients.map((recipient) => ({
      campaignId: id,
      recipientEmail: recipient.email,
      recipientName: recipient.name,
      userId: recipient.id,
      status: SendStatus.PENDING,
    }))

    if (sends.length > 0) {
      await prisma.campaignSend.createMany({
        data: sends,
      })
    }

    // TODO: Queue actual email sending (integrate with email service)
    // This would typically integrate with a service like SendGrid, Mailgun, etc.

    // Update campaign status to sent
    await prisma.marketingCampaign.update({
      where: { id },
      data: {
        status: CampaignStatus.SENT,
        completedAt: new Date(),
      },
    })
  }

  static async pauseCampaign(id: string): Promise<MarketingCampaign> {
    return await prisma.marketingCampaign.update({
      where: { id },
      data: {
        status: CampaignStatus.PAUSED,
      },
    })
  }

  static async resumeCampaign(id: string): Promise<MarketingCampaign> {
    return await prisma.marketingCampaign.update({
      where: { id },
      data: {
        status: CampaignStatus.SENDING,
      },
    })
  }

  static async cancelCampaign(id: string): Promise<MarketingCampaign> {
    return await prisma.marketingCampaign.update({
      where: { id },
      data: {
        status: CampaignStatus.CANCELLED,
        completedAt: new Date(),
      },
    })
  }

  static async getCampaignMetrics(id: string): Promise<CampaignMetrics> {
    const analytics = await prisma.campaignAnalytics.findFirst({
      where: { campaignId: id },
      orderBy: { date: 'desc' },
    })

    if (!analytics) {
      return {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0,
        revenue: 0,
        orders: 0,
        deliveryRate: 0,
        openRate: 0,
        clickRate: 0,
        bounceRate: 0,
        unsubscribeRate: 0,
        clickToOpenRate: 0,
        revenuePerRecipient: 0,
      }
    }

    const sent = analytics.sent
    const delivered = analytics.delivered
    const opened = analytics.opened
    const clicked = analytics.clicked

    return {
      sent: analytics.sent,
      delivered: analytics.delivered,
      opened: analytics.opened,
      clicked: analytics.clicked,
      bounced: analytics.bounced,
      unsubscribed: analytics.unsubscribed,
      revenue: analytics.revenue,
      orders: analytics.orders,
      deliveryRate: sent > 0 ? (delivered / sent) * 100 : 0,
      openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
      clickRate: delivered > 0 ? (clicked / delivered) * 100 : 0,
      bounceRate: sent > 0 ? (analytics.bounced / sent) * 100 : 0,
      unsubscribeRate: delivered > 0 ? (analytics.unsubscribed / delivered) * 100 : 0,
      clickToOpenRate: opened > 0 ? (clicked / opened) * 100 : 0,
      revenuePerRecipient: delivered > 0 ? analytics.revenue / delivered : 0,
    }
  }

  static async updateCampaignAnalytics(campaignId: string): Promise<void> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Aggregate send statistics
    const sendStats = await prisma.campaignSend.groupBy({
      by: ['status'],
      where: {
        campaignId,
      },
      _count: {
        status: true,
      },
    })

    const stats = sendStats.reduce(
      (acc, stat) => {
        acc[stat.status] = stat._count.status
        return acc
      },
      {} as Record<string, number>
    )

    // Calculate unique opens and clicks
    const [uniqueOpens, uniqueClicks] = await Promise.all([
      prisma.campaignSend.count({
        where: {
          campaignId,
          openedAt: { not: null },
        },
      }),
      prisma.campaignSend.count({
        where: {
          campaignId,
          clickedAt: { not: null },
        },
      }),
    ])

    // TODO: Calculate revenue and orders from tracking data
    // This would require integration with order tracking

    await prisma.campaignAnalytics.upsert({
      where: {
        campaignId_date: {
          campaignId,
          date: today,
        },
      },
      update: {
        sent: stats[SendStatus.SENT] || 0,
        delivered: stats[SendStatus.DELIVERED] || 0,
        opened: stats[SendStatus.OPENED] || 0,
        clicked: stats[SendStatus.CLICKED] || 0,
        bounced: stats[SendStatus.BOUNCED] || 0,
        unsubscribed: stats[SendStatus.UNSUBSCRIBED] || 0,
        uniqueOpens,
        uniqueClicks,
      },
      create: {
        campaignId,
        date: today,
        sent: stats[SendStatus.SENT] || 0,
        delivered: stats[SendStatus.DELIVERED] || 0,
        opened: stats[SendStatus.OPENED] || 0,
        clicked: stats[SendStatus.CLICKED] || 0,
        bounced: stats[SendStatus.BOUNCED] || 0,
        unsubscribed: stats[SendStatus.UNSUBSCRIBED] || 0,
        uniqueOpens,
        uniqueClicks,
        revenue: 0, // TODO: Calculate from order tracking
        orders: 0, // TODO: Calculate from order tracking
      },
    })
  }

  static async trackEmailOpen(campaignId: string, recipientEmail: string): Promise<void> {
    await prisma.campaignSend.updateMany({
      where: {
        campaignId,
        recipientEmail,
        openedAt: null,
      },
      data: {
        status: SendStatus.OPENED,
        openedAt: new Date(),
      },
    })

    // Update analytics
    await this.updateCampaignAnalytics(campaignId)
  }

  static async trackEmailClick(
    campaignId: string,
    recipientEmail: string,
    url: string
  ): Promise<void> {
    await prisma.campaignSend.updateMany({
      where: {
        campaignId,
        recipientEmail,
      },
      data: {
        status: SendStatus.CLICKED,
        clickedAt: new Date(),
        trackingData: {
          clickedUrl: url,
          clickedAt: new Date(),
        },
      },
    })

    // Update analytics
    await this.updateCampaignAnalytics(campaignId)
  }

  static async handleUnsubscribe(campaignId: string, recipientEmail: string): Promise<void> {
    // Update campaign send
    await prisma.campaignSend.updateMany({
      where: {
        campaignId,
        recipientEmail,
      },
      data: {
        status: SendStatus.UNSUBSCRIBED,
        unsubscribedAt: new Date(),
      },
    })

    // Update user marketing preferences
    await prisma.user.updateMany({
      where: {
        email: recipientEmail,
      },
      data: {
        marketingOptIn: false,
      },
    })

    // Update analytics
    await this.updateCampaignAnalytics(campaignId)
  }
}
