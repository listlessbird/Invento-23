import { useState } from 'react'
import { useNavigate } from 'react-router'

import { Order, VerifyOrder } from '../../api/schema'
import Button from '../../components/Button'
import { ItemCard } from '../../components/Card'
import { RZ_SCRIPT } from '../../constants'
import { useExternalScript } from '../../hooks'
import useRzp from '../../hooks/useRzp'
import { useDetailStore, useStore } from '../../store'

export function Checkout() {
    const navigate = useNavigate()
    const { items, removeItem } = useStore((store) => store)
    const { personalDetails } = useDetailStore((store) => store)
    const { handleRz, price } = useRzp()
    // const [order, setOrder] = useState<Order>()
    // const [price] = useState(() => {
    //     return items.reduce((acc, item) => acc + Number(item.regFee), 0)
    // })
    const [selectedindex, setSelectedindex] = useState(0)

    const { name, email, phone, college, referral = '' } = personalDetails

    // const [paymentStatus, setPaymentStatus] = useState<
    //     'success' | 'failed' | 'pending' | 'none'
    // >('none')

    // const status = useExternalScript(RZ_SCRIPT, {
    //     removeOnUnmount: false,
    // })

    // async function createOrder() {
    //     const body = {
    //         amount: price,
    //         attemptedBy: personalDetails.name,
    //         attemptedAt: Date.now(),
    //         attemptedEmail: personalDetails.email,
    //     }
    //     const response = await fetch('http://localhost:3001/rzp-test', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify(body),
    //     })
    //     if (!response.ok) return { error: 'Error creating order' }
    //     const data: Order = await response.json()
    //     setOrder(data)
    //     return data
    // }

    // async function handleRz() {
    //     if (status !== 'ready') {
    //         console.error('Error loading RZ pay')
    //     }
    //     setPaymentStatus('pending')
    //     const resp = await createOrder()
    //     if ('error' in resp) return console.error(resp.error)
    //     // setOrder(resp)

    //     const options = {
    //         key: import.meta.env.VITE_RZP_KEY_ID,
    //         amount: order?.amt,
    //         currency: order?.currency,
    //         name: 'Invento',
    //         description: 'Test Transaction',
    //         image: window.location.origin + '/logo.png',
    //         order_id: order?.id,
    //         // callback_url: 'http://localhost:3001/api/v1/verify',
    //         // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //         handler: async (response: any) => {
    //             setPaymentStatus('success')
    //             try {
    //                 const body = {
    //                     razorpay_payment_id: response.razorpay_payment_id,
    //                     razorpay_order_id: response.razorpay_order_id,
    //                     razorpay_signature: response.razorpay_signature,
    //                     attemptId: order?.attemptId,
    //                 }
    //                 const resp = await fetch('http://localhost:3001/api/v1/verify', {
    //                     method: 'POST',
    //                     headers: {
    //                         'Content-Type': 'application/json',
    //                     },
    //                     body: JSON.stringify(body),
    //                 })
    //                 const data: VerifyOrder = await resp.json()
    //                 console.log(data)
    //             } catch (error) {
    //                 console.error(error)
    //             }
    //         },
    //         prefill: {
    //             name: personalDetails.name,
    //             email: personalDetails.email,
    //             contact: personalDetails.phone,
    //         },
    //         notes: {
    //             address: 'Razorpay Corporate Office',
    //         },
    //         theme: {
    //             color: '#3399cc',
    //         },
    //     }
    //     console.log(options.key, options.order_id)
    //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //     const _window = window as any
    //     const paymentObj = new _window.Razorpay(options)

    //     paymentObj.on('payment.failed', function (response: unknown) {
    //         console.log(response)
    //         setPaymentStatus('failed')
    //     })
    //     paymentObj.open()
    // }
    // console.log(`Personal Details`, personalDetails)
    return (
        <div className="formParentWrap centeredContainer flow side-padding light-scheme mh-full checkout_main">
            <div>
                <h2 className="FormHeading text-black fw-400 ff-serif">
                    Personal Information
                </h2>
                <div className="FormWrap bg-white checkout__personalWrap text-black ff-serif flow">
                    <h3 className="capitalize">{name}</h3>
                    <p>{college}</p>
                    <p>{email}</p>
                    <p>{phone}</p>
                    {referral && <p>Referall Id: {referral}</p>}
                </div>
            </div>
            <div className="">
                <h3 className="text-black ff-serif fw-400">Selected events</h3>
            </div>
            <div className="form__eventsWrap bg-white flow grid">
                {items.map((item) => (
                    <ItemCard
                        mode="show"
                        itemId={item._id}
                        group={item.participationType === 'group' ? true : false}
                        maxParticipants={
                            item.participationType === 'group' ? item.members.length : 0
                        }
                        key={item?._id}
                        title={item.name}
                        date={item.date}
                        fee={Number(item.regFee)}
                        image={item?.image || '/static/natya.jpg'}
                        actionType="nonTogglable"
                        action={() => removeItem(item._id)}
                        selected={true}
                        onClick={() => {
                            setSelectedindex(Number(item._id))
                            // setisFilled((state) => !state)
                        }}
                    />
                ))}
                <div className="text-black ff-serif">
                    <p>Total: &#8377;{price}</p>
                </div>
                <div className="checkout_btn_wrap flex flex-col">
                    <Button
                        type="button"
                        className="btn btn--go-back ff-serif"
                        onClick={() => navigate(-1)}
                        style={{
                            textTransform: 'capitalize',
                        }}
                    >
                        Go Back
                    </Button>
                    <Button
                        type="button"
                        className="btn btn--checkout ff-serif"
                        style={{
                            textTransform: 'none',
                        }}
                        onClick={handleRz}
                    >
                        Proceed to payment
                    </Button>
                </div>
            </div>
        </div>
    )
}
