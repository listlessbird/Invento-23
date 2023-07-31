import { useState } from 'react'

import { Order, VerifyOrder } from '../../api/schema'
import Button from '../../components/Button'
import { RZ_SCRIPT } from '../../constants'
import { useExternalScript } from '../../hooks'
import { useDetailStore, useStore } from '../../store'

export function Checkout() {
    const { items } = useStore((store) => store)
    const { personalDetails } = useDetailStore((store) => store)
    const [order, setOrder] = useState<Order>()
    const [price, setPrice] = useState(() => {
        return items.reduce((acc, item) => acc + Number(item.fee), 0)
    })

    const [paymentStatus, setPaymentStatus] = useState<
        'success' | 'failed' | 'pending' | 'none'
    >('none')

    const status = useExternalScript(RZ_SCRIPT, {
        removeOnUnmount: true,
    })

    async function createOrder() {
        const body = {
            amount: price,
            attemptedBy: personalDetails.name,
            attemptedAt: Date.now(),
            attemptedEmail: personalDetails.email,
        }
        const response = await fetch('http://localhost:3001/rzp-test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })
        if (!response.ok) return { error: 'Error creating order' }
        const data: Order = await response.json()
        setOrder(data)
        return data
    }

    async function handleRz() {
        if (status !== 'ready') {
            console.error('Error loading RZ pay')
        }
        setPaymentStatus('pending')
        const resp = await createOrder()
        if ('error' in resp) return console.error(resp.error)
        // setOrder(resp)

        const options = {
            key: import.meta.env.VITE_RZP_KEY_ID,
            amount: order?.amt,
            currency: order?.currency,
            name: 'Invento',
            description: 'Test Transaction',
            image: window.location.origin + '/logo.png',
            order_id: order?.id,
            // callback_url: 'http://localhost:3001/api/v1/verify',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            handler: async (response: any) => {
                setPaymentStatus('success')
                try {
                    const body = {
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                        attemptId: order?.attemptId,
                    }
                    const resp = await fetch('http://localhost:3001/api/v1/verify', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(body),
                    })
                    const data: VerifyOrder = await resp.json()
                    console.log(data)
                } catch (error) {
                    console.error(error)
                }
            },
            prefill: {
                name: personalDetails.name,
                email: personalDetails.email,
                contact: personalDetails.phone,
            },
            notes: {
                address: 'Razorpay Corporate Office',
            },
            theme: {
                color: '#3399cc',
            },
        }
        console.log(options.key, options.order_id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const _window = window as any
        const paymentObj = new _window.Razorpay(options)

        paymentObj.on('payment.failed', function (response: unknown) {
            console.log(response)
            setPaymentStatus('failed')
        })
        paymentObj.open()
    }

    return (
        <div className="mh-full bg-white text-black">
            <h1>Checkout</h1>
            <h2>Payment Status: {paymentStatus}</h2>

            <Button type="button" onClick={handleRz}>
                Pay {price}
            </Button>
        </div>
    )
}
