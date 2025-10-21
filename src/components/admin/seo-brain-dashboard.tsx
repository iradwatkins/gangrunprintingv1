'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Activity, Brain, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'

interface Campaign {
  id: string
  productName: string
  status: string
  citiesGenerated: number
  totalCities: number
  progress: number
}

interface PerformanceData {
  topPerformers: Array<{
    city: string
    views: number
    conversions: number
    revenue: number
  }>
  bottomPerformers: Array<{
    city: string
    views: number
    conversions: number
    revenue: number
  }>
  summary: {
    totalCities: number
    totalViews: number
    totalConversions: number
    totalRevenue: number
  }
}

interface PendingDecision {
  id: string
  title: string
  description: string
  options: {
    A: { action: string; confidence: number }
    B: { action: string; confidence: number }
    C: { action: string; confidence: number }
  }
  createdAt: string
}

export function SEOBrainDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null)
  const [performance, setPerformance] = useState<PerformanceData | null>(null)
  const [decisions, setDecisions] = useState<PendingDecision[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCampaigns()
    loadPendingDecisions()
  }, [])

  useEffect(() => {
    if (selectedCampaign) {
      loadPerformance(selectedCampaign)
    }
  }, [selectedCampaign])

  async function loadCampaigns() {
    try {
      const res = await fetch('/api/seo-brain/campaigns')
      const data = await res.json()
      setCampaigns(data.campaigns || [])
      if (data.campaigns?.length > 0) {
        setSelectedCampaign(data.campaigns[0].id)
      }
    } catch (error) {
      console.error('Failed to load campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadPerformance(campaignId: string) {
    try {
      const res = await fetch(`/api/seo-brain/performance?campaignId=${campaignId}`)
      const data = await res.json()
      setPerformance(data)
    } catch (error) {
      console.error('Failed to load performance:', error)
    }
  }

  async function loadPendingDecisions() {
    try {
      const res = await fetch('/api/seo-brain/approve-decision')
      const data = await res.json()
      setDecisions(data.decisions || [])
    } catch (error) {
      console.error('Failed to load decisions:', error)
    }
  }

  async function handleDecision(decisionId: string, option: string) {
    try {
      await fetch('/api/seo-brain/approve-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decisionId, selectedOption: option }),
      })
      loadPendingDecisions()
    } catch (error) {
      console.error('Failed to approve decision:', error)
    }
  }

  async function triggerAnalysis() {
    if (!selectedCampaign) return
    try {
      await fetch('/api/seo-brain/analyze-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: selectedCampaign }),
      })
      alert('Analysis started! Check Telegram for decisions.')
    } catch (error) {
      console.error('Failed to start analysis:', error)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">SEO Brain Dashboard</h1>
            <p className="text-sm text-muted-foreground">Autonomous 200-city optimization</p>
          </div>
        </div>
        <Button disabled={!selectedCampaign} onClick={triggerAnalysis}>
          <Activity className="mr-2 h-4 w-4" />
          Analyze Now
        </Button>
      </div>

      {/* Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Active Campaigns</CardTitle>
          <CardDescription>Select a campaign to view performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                  selectedCampaign === campaign.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedCampaign(campaign.id)}
              >
                <div className="font-medium">{campaign.productName}</div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{campaign.citiesGenerated}/200 cities</span>
                  <Badge variant={campaign.status === 'COMPLETED' ? 'default' : 'secondary'}>
                    {campaign.status}
                  </Badge>
                </div>
                {campaign.progress < 100 && (
                  <div className="mt-2 h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${campaign.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      {performance && (
        <>
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Cities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performance.summary.totalCities}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performance.summary.totalViews.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Conversions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performance.summary.totalConversions}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${performance.summary.totalRevenue.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          {/* Top/Bottom Performers */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performance.topPerformers.slice(0, 5).map((city, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <div className="font-medium">{city.city}</div>
                        <div className="text-sm text-muted-foreground">
                          {city.views} views • {city.conversions} conversions
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${city.revenue}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  Needs Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performance.bottomPerformers.slice(0, 5).map((city, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <div className="font-medium">{city.city}</div>
                        <div className="text-sm text-muted-foreground">
                          {city.views} views • {city.conversions} conversions
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${city.revenue}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Pending Decisions */}
      {decisions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Pending Decisions ({decisions.length})
            </CardTitle>
            <CardDescription>AI-generated improvement options awaiting your approval</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {decisions.map((decision) => (
              <div key={decision.id} className="rounded-lg border p-4">
                <div className="mb-3">
                  <div className="font-medium">{decision.title}</div>
                  <div className="text-sm text-muted-foreground">{decision.description}</div>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {['A', 'B', 'C'].map((opt) => {
                    const option = decision.options[opt as 'A' | 'B' | 'C']
                    return (
                      <div key={opt} className="rounded-lg border p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <Badge variant="outline">Option {opt}</Badge>
                          <span className="text-xs text-muted-foreground">{option.confidence}% confidence</span>
                        </div>
                        <div className="mb-3 text-sm">{option.action}</div>
                        <Button className="w-full" size="sm" onClick={() => handleDecision(decision.id, opt)}>
                          Select {opt}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
