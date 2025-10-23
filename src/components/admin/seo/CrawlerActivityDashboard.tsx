/**
 * Crawler Activity Dashboard Component
 *
 * Displays bot crawl analytics with clean visualizations
 * Shows which AI bots and search engines are discovering your site
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Bot, TrendingUp, Globe, Zap, AlertCircle } from 'lucide-react'

interface CrawlerStat {
  name: string
  category: string
  requests: number
  lastSeen: string | null
  change: number // percentage change from previous period
}

interface Props {
  className?: string
}

export function CrawlerActivityDashboard({ className = '' }: Props) {
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState<7 | 30 | 90>(30)
  const [crawlers, setCrawlers] = useState<CrawlerStat[]>([])

  useEffect(() => {
    fetchCrawlerData()
  }, [days])

  const fetchCrawlerData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/crawler-analytics?days=${days}`)
      const data = await response.json()

      // Mock data for demonstration
      const mockCrawlers: CrawlerStat[] = [
        { name: 'Google', category: 'Search Engine', requests: 0, lastSeen: null, change: 0 },
        { name: 'Bing', category: 'Search Engine', requests: 0, lastSeen: null, change: 0 },
        { name: 'ChatGPT (OpenAI)', category: 'AI Search', requests: 0, lastSeen: null, change: 0 },
        {
          name: 'Claude (Anthropic)',
          category: 'AI Search',
          requests: 0,
          lastSeen: null,
          change: 0,
        },
        { name: 'Perplexity AI', category: 'AI Search', requests: 0, lastSeen: null, change: 0 },
      ]

      setCrawlers(mockCrawlers)
    } catch (error) {
      console.error('Failed to fetch crawler data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Search Engine':
        return <Globe className="w-5 h-5" />
      case 'AI Search':
        return <Bot className="w-5 h-5" />
      case 'Archival':
        return <TrendingUp className="w-5 h-5" />
      default:
        return <Zap className="w-5 h-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Search Engine':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'AI Search':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'Archival':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'Blocked':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const totalCrawls = crawlers.reduce((sum, c) => sum + c.requests, 0)
  const aiCrawls = crawlers
    .filter((c) => c.category === 'AI Search')
    .reduce((sum, c) => sum + c.requests, 0)
  const searchEngineCrawls = crawlers
    .filter((c) => c.category === 'Search Engine')
    .reduce((sum, c) => sum + c.requests, 0)

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bot className="w-6 h-6" />
            Crawler Activity
          </h2>
          <p className="text-gray-600 mt-1">
            Track which bots are discovering and indexing your site
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {([7, 30, 90] as const).map((d) => (
            <button
              key={d}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                days === d
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border hover:border-blue-300'
              }`}
              onClick={() => setDays(d)}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Crawls</CardDescription>
            <CardTitle className="text-3xl">{totalCrawls.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">Last {days} days</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Search Engines</CardDescription>
            <CardTitle className="text-3xl flex items-baseline gap-2">
              {searchEngineCrawls.toLocaleString()}
              <span className="text-sm text-gray-500 font-normal">
                ({totalCrawls > 0 ? Math.round((searchEngineCrawls / totalCrawls) * 100) : 0}%)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-blue-600 flex items-center gap-1">
              <Globe className="w-4 h-4" />
              Google, Bing, Apple
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>AI Crawlers</CardDescription>
            <CardTitle className="text-3xl flex items-baseline gap-2">
              {aiCrawls.toLocaleString()}
              <span className="text-sm text-gray-500 font-normal">
                ({totalCrawls > 0 ? Math.round((aiCrawls / totalCrawls) * 100) : 0}%)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-purple-600 flex items-center gap-1">
              <Bot className="w-4 h-4" />
              ChatGPT, Claude, Perplexity
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Banner */}
      {totalCrawls === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-900 mb-1">Crawler data is collecting</h4>
            <p className="text-sm text-amber-700">
              It may take 24-48 hours after submitting your sitemap before crawlers discover your
              site. Make sure you've submitted sitemaps to{' '}
              <a
                className="underline"
                href="https://search.google.com/search-console"
                rel="noopener noreferrer"
                target="_blank"
              >
                Google Search Console
              </a>{' '}
              and{' '}
              <a
                className="underline"
                href="https://www.bing.com/webmasters"
                rel="noopener noreferrer"
                target="_blank"
              >
                Bing Webmaster Tools
              </a>
              .
            </p>
          </div>
        </div>
      )}

      {/* Crawler List */}
      <Card>
        <CardHeader>
          <CardTitle>Crawler Breakdown</CardTitle>
          <CardDescription>Detailed activity by individual bots</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs className="w-full" defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Crawlers</TabsTrigger>
              <TabsTrigger value="search">Search Engines</TabsTrigger>
              <TabsTrigger value="ai">AI Bots</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <CrawlerList
                crawlers={crawlers}
                getCategoryColor={getCategoryColor}
                getCategoryIcon={getCategoryIcon}
              />
            </TabsContent>

            <TabsContent value="search">
              <CrawlerList
                crawlers={crawlers.filter((c) => c.category === 'Search Engine')}
                getCategoryColor={getCategoryColor}
                getCategoryIcon={getCategoryIcon}
              />
            </TabsContent>

            <TabsContent value="ai">
              <CrawlerList
                crawlers={crawlers.filter((c) => c.category === 'AI Search')}
                getCategoryColor={getCategoryColor}
                getCategoryIcon={getCategoryIcon}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="mt-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle>📊 Maximize Your Crawler Visibility</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                1
              </div>
              <div>
                <strong>Submit Sitemaps:</strong> Add your sitemap to Google Search Console and Bing
                Webmaster Tools.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                2
              </div>
              <div>
                <strong>Create FAQ Content:</strong> AI bots love question-answer format. Visit{' '}
                <a className="text-blue-600 underline" href="/faq">
                  /faq
                </a>{' '}
                to see examples.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                3
              </div>
              <div>
                <strong>Monitor Weekly:</strong> Check this dashboard weekly to see which bots are
                visiting and optimize accordingly.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface CrawlerListProps {
  crawlers: CrawlerStat[]
  getCategoryIcon: (category: string) => React.ReactNode
  getCategoryColor: (category: string) => string
}

function CrawlerList({ crawlers, getCategoryIcon, getCategoryColor }: CrawlerListProps) {
  if (crawlers.length === 0) {
    return <div className="text-center py-8 text-gray-500">No crawler data available yet</div>
  }

  return (
    <div className="space-y-3">
      {crawlers.map((crawler) => (
        <div
          key={crawler.name}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-lg ${getCategoryColor(crawler.category)}`}>
              {getCategoryIcon(crawler.category)}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{crawler.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="text-xs" variant="outline">
                  {crawler.category}
                </Badge>
                {crawler.lastSeen && (
                  <span className="text-xs text-gray-500">
                    Last seen: {new Date(crawler.lastSeen).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {crawler.requests.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">requests</div>
          </div>
        </div>
      ))}
    </div>
  )
}
