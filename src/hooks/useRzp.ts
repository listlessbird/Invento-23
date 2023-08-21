import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { Order, VerifyOrder } from '../api/schema'
import { RZ_SCRIPT } from '../constants'
import { useDetailStore, useStore } from '../store/'
import { useExternalScript } from './useExternalScript'

export default function useRzp() {
    const navigate = useNavigate()

    const { items } = useStore((store) => store)
    const { personalDetails } = useDetailStore((store) => store)
    const [order, setOrder] = useState<Order>()
    const [price] = useState(() => {
        return items.reduce((acc, item) => acc + Number(item.regFee), 0)
    })

    const status = useExternalScript(RZ_SCRIPT, {
        removeOnUnmount: false,
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
        // setOrder(data)
        return data
    }

    async function handleRz() {
        if (status !== 'ready') {
            console.error('Error loading RZ pay')
            toast.error('Error loading RZ pay')
            return
        }
        const resp = await createOrder()
        if ('error' in resp) {
            console.error(resp.error)
            return
        }
        setOrder(resp)

        const options = {
            key: import.meta.env.VITE_RZP_KEY_ID,
            // amount: order?.amt,
            amount: price * 100,
            // currency: order?.currency,
            currency: 'INR',
            name: 'Invento',
            description: 'Test Transaction',
            image: window.location.origin + '/logo.png',
            order_id: order?.id,
            // callback_url: 'http://localhost:3001/api/v1/verify',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            handler: async (response: any) => {
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
                    if (data.success) {
                        document.body.style.overflow = 'auto'
                    }
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
                address: 'Government Engineering College, Sreekrishnapuram',
            },
            theme: {
                color: '#3399cc',
            },
            modal: {
                ondismiss: function () {
                    document.body.style.overflow = 'auto'
                    // setTimeout(() => navigate('/status?state=failure'), 1000)
                    navigate('/status?state=failure')
                },
            },
        }
        console.log(options.key, options.order_id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const _window = window as any
        const paymentObj = new _window.Razorpay(options)

        paymentObj.on('payment.failed', function (response: unknown) {
            document.body.style.overflow = 'auto'
            setTimeout(() => navigate('/status?state=failure'), 1000)
        })
        paymentObj.open()
    }

    return {
        price,
        handleRz,
    }
}
