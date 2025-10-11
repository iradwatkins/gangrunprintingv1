import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const missingAirports = [
  {
    code: 'OGG',
    name: 'Maui',
    carrier: 'SOUTHWEST_CARGO',
    operator: 'Hawaiian Air Cargo',
    address: 'c/o 870 Haleakala Highway',
    city: 'Kahului',
    state: 'HI',
    zip: '96732',
    hours: {
      'Mon-Fri': '6:00am-7:00pm',
      'Sat-Sun': '6:00am-1:00pm',
    },
  },
  {
    code: 'LGA',
    name: 'New York LaGuardia',
    carrier: 'SOUTHWEST_CARGO',
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
    code: 'OKC',
    name: 'Oklahoma City',
    carrier: 'SOUTHWEST_CARGO',
    operator: null,
    address: 'Bay Q, 7130 Air Cargo Rd',
    city: 'Oklahoma City',
    state: 'OK',
    zip: '73159',
    hours: {
      'Mon-Wed': '5:00am-12:30am',
      'Thu-Fri': '5:00am-9:30pm',
      'Sat-Sun': '5:30am-2:00pm',
    },
  },
  {
    code: 'SNA',
    name: 'Orange County',
    carrier: 'SOUTHWEST_CARGO',
    operator: 'Majestic Terminal Services',
    address: 'Bay 5, 3000 B Airway Ave',
    city: 'Costa Mesa',
    state: 'CA',
    zip: '92626',
    hours: {
      'Mon-Fri': '5:00am-11:00pm',
      Sat: '8:00am-10:00pm',
      Sun: 'Closed',
    },
  },
  {
    code: 'PHL',
    name: 'Philadelphia',
    carrier: 'SOUTHWEST_CARGO',
    operator: null,
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
    code: 'PIT',
    name: 'Pittsburgh',
    carrier: 'SOUTHWEST_CARGO',
    operator: 'Worldwide Flight Services',
    address: 'Pittsburgh International Airport, 3000 Halverson Rd, Building 846',
    city: 'Pittsburgh',
    state: 'PA',
    zip: '15231',
    hours: {
      'Mon-Fri': '6:00am-11:00pm',
      'Sat-Sun': '9:00am-5:00pm',
    },
  },
  {
    code: 'PVD',
    name: 'Providence',
    carrier: 'SOUTHWEST_CARGO',
    operator: 'Jetstream Ground Services, Inc.',
    address: 'T.F. Green Airport 2000 Post Rd',
    city: 'Warwick',
    state: 'RI',
    zip: '02886',
    hours: {
      'Mon-Fri': '6:00am-10:30pm',
      Sat: '8:00am-4:00pm',
      Sun: 'Closed',
    },
  },
  {
    code: 'RIC',
    name: 'Richmond',
    carrier: 'SOUTHWEST_CARGO',
    operator: 'Commonwealth Cargo, Inc.',
    address: '5501 Fox Rd Cargo Bldg 5',
    city: 'Richmond',
    state: 'VA',
    zip: '23250',
    hours: {
      'Mon-Fri': '5:30am-8:00pm',
      Sat: '5:30am-12:00pm',
      Sun: 'Closed',
    },
  },
  {
    code: 'SJU',
    name: 'San Juan',
    carrier: 'SOUTHWEST_CARGO',
    operator: 'Grnd Motive Dependable Airline Service',
    address: 'Cargo Service Corp. Bldg, Suite E-5 Base Muniz, Luis Munoz Marin Intl airport',
    city: 'Carolina',
    state: 'PR',
    zip: '00937',
    hours: {
      'Mon-Sun': '4:30am-10:30pm',
    },
  },
  {
    code: 'IAD',
    name: 'Washington Dulles',
    carrier: 'SOUTHWEST_CARGO',
    operator: 'Worldwide Flight Services',
    address: '23703 B Air Freight Lane, Cargo Bldg 6',
    city: 'Sterling',
    state: 'VA',
    zip: '20166',
    hours: {
      'Mon-Sun': '5:00am-10:00pm',
    },
  },
]

async function main() {
  console.log('🛫 Seeding the 10 missing Southwest Cargo airports...\n')

  for (const airport of missingAirports) {
    try {
      await prisma.airport.upsert({
        where: { code: airport.code },
        update: airport,
        create: {
          id: `airport_${airport.code.toLowerCase()}`,
          ...airport,
          isActive: true,
        },
      })
      console.log(`✅ ${airport.name} (${airport.code})`)
    } catch (error) {
      console.error(`❌ Failed to seed ${airport.name}:`, error)
    }
  }

  const totalCount = await prisma.airport.count({
    where: { carrier: 'SOUTHWEST_CARGO', isActive: true },
  })

  console.log(`\n✨ Complete! Now ${totalCount} Southwest Cargo airports in database`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
