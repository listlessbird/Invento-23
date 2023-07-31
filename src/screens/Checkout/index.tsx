import Footer from '../../components/Footer/Footer'
import Nav from '../../components/Navigation'
import { Checkout } from './checkout'

export function CheckoutLayout() {
    return (
        <div>
            <Nav background="hsl(266, 12%, 12%)" progressLineColor="" />
            <Checkout />
            <Footer background={''} />
        </div>
    )
}
