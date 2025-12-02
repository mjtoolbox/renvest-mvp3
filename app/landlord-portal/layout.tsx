import SimpleFooter from '../components/Footer/SimpleFooter'
import HideGlobalFooter from './HideGlobalFooter'

export const metadata = { title: 'Landlord Portal - Renvestment' }

export default function LandlordLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HideGlobalFooter />
      <main>{children}</main>
      <SimpleFooter />
    </>
  )
}
