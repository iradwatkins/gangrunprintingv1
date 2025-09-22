/**
 * page - misc definitions
 * Auto-refactored by BMAD
 */

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
import {
import Link from 'next/link'


'use client'

  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
  MapPin,
  Phone,
  Clock,
  Search,
  Plane,
  Building2,
  Navigation,
  Package,
  Truck,
  Info,
} from 'lucide-react'

// Retail locations data
const retailLocations = [
  {
    id: 'chicago-cottage',
    name: 'Chicago - Cottage Grove Ave',
    address: '4856 S Cottage Grove Ave',
    city: 'Chicago',
    state: 'IL',
    zip: '60615',
    phone: '(312) 929-3376',
    hours: {
      'Monday - Friday': '1:00pm to 9:00pm',
      'Saturday - Sunday': 'Closed',
    },
    type: 'retail',
  },
  {
    id: 'chicago-western',
    name: 'Chicago - Western Ave',
    address: '1300 N Western Ave',
    city: 'Chicago',
    state: 'IL',
    zip: '60622',
    phone: '(773) 819-7613',
    hours: {
      'Monday - Friday': '1:00pm to 9:00pm',
      'Saturday - Sunday': 'Closed',
    },
    type: 'retail',
  },
]

// Air cargo locations data (abbreviated for space - full list would include all locations)
const airCargoLocations = [
  {
    id: 'albany',
    code: 'ALB',
    name: 'Albany',
    carrier: 'Southwest Airlines Cargo',
    operator: 'Mobile Air Transport',
    address: '46 Kelly Rd',
    city: 'Latham',
    state: 'NY',
    zip: '12110',
    hours: {
      'Mon-Fri': '5:00am-9:00pm',
      'Sat-Sun': 'Closed',
    },
  },
  {
    id: 'atlanta',
    code: 'ATL',
    name: 'Atlanta',
    carrier: 'Southwest Airlines Cargo',
    address: '3400 Interloop Rd, Space G2-Cargo',
    city: 'Atlanta',
    state: 'GA',
    zip: '30354',
    hours: {
      'Mon-Fri': '5:00am-12:00am',
      'Sat-Sun': '5:00am-11:00pm',
    },
  },
  {
    id: 'austin',
    code: 'AUS',
    name: 'Austin',
    carrier: 'Southwest Airlines Cargo',
    address: '3400 Spirit of Texas Dr Ste 250',
    city: 'Austin',
    state: 'TX',
    zip: '78719',
    hours: {
      'Mon-Fri': '4:30am-1:30am',
      Sat: '5:30am-9:00pm',
      Sun: '4:30am-9:00pm',
    },
  },
  {
    id: 'boston',
    code: 'BOS',
    name: 'Boston',
    carrier: 'Southwest Airlines Cargo',
    address: '112 Harborside Dr South Cargo Bldg 63',
    city: 'Boston',
    state: 'MA',
    zip: '02128',
    hours: {
      'Mon-Fri': '4:30am-12:00am',
      Sat: '5:00am-7:00pm',
      Sun: '5:00am-5:00pm',
    },
  },
  {
    id: 'chicago-mdw',
    code: 'MDW',
    name: 'Chicago Midway',
    carrier: 'Southwest Airlines Cargo',
    address: '5600 S Cicero Ave',
    city: 'Chicago',
    state: 'IL',
    zip: '60638',
    hours: {
      'Mon-Fri': '4:30am-12:00am',
      Sat: '5:00am-10:00pm',
      Sun: '5:00am-10:00pm',
    },
  },
  {
    id: 'dallas',
    code: 'DAL',
    name: 'Dallas',
    carrier: 'Southwest Airlines Cargo',
    address: '7510 Aviation Place Ste 110',
    city: 'Dallas',
    state: 'TX',
    zip: '75235',
    hours: {
      'Mon-Fri': '4:30am-1:30am',
      Sat: '4:30am-12:00am',
      Sun: '4:30am-1:30am',
    },
  },
  {
    id: 'denver',
    code: 'DEN',
    name: 'Denver',
    carrier: 'Southwest Airlines Cargo',
    address: '7640 N Undergrove St (Suite E)',
    city: 'Denver',
    state: 'CO',
    zip: '80249',
    hours: {
      'Mon-Sat': '4:30am-12:00am',
      Sun: '5:00am-12:00am',
    },
  },
  {
    id: 'houston-hobby',
    code: 'HOU',
    name: 'Houston Hobby',
    carrier: 'Southwest Airlines Cargo',
    address: '7910 Airport Blvd',
    city: 'Houston',
    state: 'TX',
    zip: '77061',
    hours: {
      Mon: '4:00am-12:00am',
      'Tue-Fri': 'Open 24 hours',
      Sat: '12:00am-12:00am',
      Sun: '5:00am-12:00am',
    },
  },
  {
    id: 'las-vegas',
    code: 'LAS',
    name: 'Las Vegas',
    carrier: 'Southwest Airlines Cargo',
    address: '6055 Surrey St Ste 121',
    city: 'Las Vegas',
    state: 'NV',
    zip: '89119',
    hours: {
      'Mon-Fri': '4:30am-11:30pm',
      'Sat-Sun': '6:00am-9:30pm',
    },
  },
  {
    id: 'los-angeles',
    code: 'LAX',
    name: 'Los Angeles',
    carrier: 'Southwest Airlines Cargo',
    address: '5600 W Century Blvd',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90045',
    hours: {
      Mon: '4:30am-12:00am',
      'Tue-Fri': 'Open 24 hours',
      Sat: '12:00am-12:00am',

      Sun: '5:00am-12:00am',
    },
  },
  {
    id: 'miami',
    code: 'MIA',
    name: 'Miami',
    carrier: 'Southwest Airlines Cargo',
    operator: 'Swissport Cargo Services',
    address: '1851 NW 68th Avenue, Cargo Building 706 STE 225',
    city: 'Miami',
    state: 'FL',
    zip: '33126',
    hours: {
      'Mon-Sun': '6:00am-6:00pm',
    },
  },
  {
    id: 'new-york-lga',
    code: 'LGA',
    name: 'New York LaGuardia',
    carrier: 'Southwest Airlines Cargo',
    operator: 'JetStream Ground Services, Inc.',
    address: 'Cargo Building Hangar 5A',
    city: 'Flushing',
    state: 'NY',
    zip: '11371',
    hours: {
      Mon: '5:00am-12:00am',
      'Tue-Thu': 'Open 24 hours',
      Fri: '12:00am-12:00am',
      'Sat-Sun': '5:00am-11:00pm',
    },
  },
  {
    id: 'orlando',
    code: 'MCO',
    name: 'Orlando',
    carrier: 'Southwest Airlines Cargo',
    address: '8835 Bear Rd',
    city: 'Orlando',
    state: 'FL',
    zip: '32827',
    hours: {
      'Mon-Fri': '5:00am-1:00am',
      'Sat-Sun': '6:00am-11:00pm',
    },
  },
  {
    id: 'philadelphia',
    code: 'PHL',
    name: 'Philadelphia',
    carrier: 'Southwest Airlines Cargo',
    address: 'Philadelphia International Airport, Cargo City Bldg C-2 Doors 16-18',
    city: 'Philadelphia',
    state: 'PA',
    zip: '19153',
    hours: {
      'Mon-Fri': '5:00am-1:00am',
      'Sat-Sun': '6:00am-2:00pm',
    },
  },
  {
    id: 'phoenix',
    code: 'PHX',
    name: 'Phoenix',
    carrier: 'Southwest Airlines Cargo',
    address: '1251 S 25th PIace Ste 16',
    city: 'Phoenix',
    state: 'AZ',
    zip: '85034',
    hours: {
      'Mon-Fri': '4:15am-1:30am',
      Sat: '5:00am-12:45am',
      Sun: '5:00am-1:30am',
    },
  },
  {
    id: 'san-francisco',
    code: 'SFO',
    name: 'San Francisco',
    carrier: 'Southwest Airlines Cargo',
    address: 'San Francisco International Airport, 606 N.McDonnell Rd',
    city: 'San Francisco',
    state: 'CA',
    zip: '94128',
    hours: {
      'Mon-Fri': '5:30am-12:00am',
      Sat: '5:30am-9:00pm',
      Sun: '10:00am-6:00pm',
    },
  },
  {
    id: 'seattle',
    code: 'SEA',
    name: 'Seattle/Tacoma',
    carrier: 'Southwest Airlines Cargo',
    address: '16215 Air Cargo Rd',
    city: 'Seattle',
    state: 'WA',
    zip: '98158',
    hours: {
      'Mon-Fri': '5:00am-12:00am',
      'Sat-Sun': '6:00am-10:00pm',
    },
  },
]
