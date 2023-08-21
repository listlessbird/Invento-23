import { ReactComponent as InventoLogo } from '../assets/svg/invento__logo-outline-full.svg'
import Button from '../components/Button'

type Props = {
    status: 'REDIRECT' | 'SUCCESS' | 'FAILURE'
}

export default function Status({ status }: Props) {
    const success = (
        <div className="status--success flow ff-serif">
            <h1 className="status__title ff-serif fw-400">Payment Successful</h1>
            <p>
                Yayy! Your payment was successful!!! 🎉🎉.
                <br /> You will receive an email shortly with your registration.
            </p>
            <p>Hold on while we redirect you to the home page &lt;3</p>
        </div>
    )

    const failure = (
        <div className="status--success flow ff-serif">
            <h1 className="status__title ff-serif fw-400">Payment Failure</h1>
            <p>
                oops! something went wrong with your payment :&#40;
                <br /> Don’t worry, if your account is debited, it’ll come back in 1-2
                days.
            </p>
            <p>Hold on while we redirect you to the home page &lt;3</p>
            <div className="wrap-buttons flex flex-center">
                <Button
                    to="/"
                    type="internalUrl"
                    classNames="btn btn--go-back text-black"
                >
                    Go Home
                </Button>
                <Button
                    to="/checkout"
                    type="internalUrl"
                    classNames="btn btn--go-back text-black"
                >
                    Try Again
                </Button>
            </div>
        </div>
    )

    const redirect = (
        <div className="status--success flow ff-serif">
            <h1 className="status__title ff-serif fw-400 flex flex-center">
                Redirecting <div className="dot-elastic"></div>
            </h1>
            <p>
                We&apos;re setting up your payment. <br /> Hold on while we redirect you
                to the payment gateway.
            </p>
        </div>
    )

    return (
        <section className="status__main bg-white text-black side-padding grid">
            <div className="centeredContainer wrapper grid">
                <InventoLogo className="status__logo" />
                {status === 'SUCCESS' && success}
                {status === 'FAILURE' && failure}
                {status === 'REDIRECT' && redirect}
            </div>
        </section>
    )
}
