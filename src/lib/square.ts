import { Client, Environment } from 'square'

const squareClient = new Client({
  environment: process.env.SQUARE_ENVIRONMENT === 'production' 
    ? Environment.Production 
    : Environment.Sandbox,
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
})

export const squarePaymentsApi = squareClient.paymentsApi
export const squareOrdersApi = squareClient.ordersApi
export const squareCustomersApi = squareClient.customersApi
export const squareLocationsApi = squareClient.locationsApi
export const squareCheckoutApi = squareClient.checkoutApi

export const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID!

export async function createSquareCheckout(
  orderData: {
    email: string
    amount: number
    orderNumber: string
    items: Array<{
      name: string
      quantity: string
      basePriceMoney: {
        amount: bigint
        currency: string
      }
    }>
  }
) {
  try {
    const response = await squareCheckoutApi.createPaymentLink({
      idempotencyKey: crypto.randomUUID(),
      quickPay: {
        name: `Order #${orderData.orderNumber}`,
        priceMoney: {
          amount: BigInt(Math.round(orderData.amount * 100)),
          currency: 'USD',
        },
        locationId: SQUARE_LOCATION_ID,
      },
      checkoutOptions: {
        redirectUrl: `${process.env.NEXTAUTH_URL}/orders/confirmation`,
        askForShippingAddress: true,
        merchantSupportEmail: process.env.SENDGRID_FROM_EMAIL,
      },
      prePopulatedData: {
        buyerEmail: orderData.email,
      },
      paymentNote: `Order #${orderData.orderNumber}`,
    })

    return response.result.paymentLink
  } catch (error) {
    console.error('Square checkout error:', error)
    throw error
  }
}

export async function retrieveSquarePayment(paymentId: string) {
  try {
    const response = await squarePaymentsApi.getPayment(paymentId)
    return response.result.payment
  } catch (error) {
    console.error('Square payment retrieval error:', error)
    throw error
  }
}

export async function createOrUpdateSquareCustomer(
  email: string,
  name?: string,
  phone?: string
) {
  try {
    // First, try to find existing customer
    const searchResponse = await squareCustomersApi.searchCustomers({
      filter: {
        emailAddress: {
          exact: email,
        },
      },
    })

    if (searchResponse.result.customers && searchResponse.result.customers.length > 0) {
      // Update existing customer
      const customer = searchResponse.result.customers[0]
      const updateResponse = await squareCustomersApi.updateCustomer(
        customer.id!,
        {
          givenName: name?.split(' ')[0],
          familyName: name?.split(' ').slice(1).join(' '),
          phoneNumber: phone,
        }
      )
      return updateResponse.result.customer
    } else {
      // Create new customer
      const createResponse = await squareCustomersApi.createCustomer({
        idempotencyKey: crypto.randomUUID(),
        givenName: name?.split(' ')[0],
        familyName: name?.split(' ').slice(1).join(' '),
        emailAddress: email,
        phoneNumber: phone,
      })
      return createResponse.result.customer
    }
  } catch (error) {
    console.error('Square customer error:', error)
    throw error
  }
}