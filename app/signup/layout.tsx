export const metadata = {
  title: 'Sign up - Renvestment'
}

import SimpleFooter from '../components/Footer/SimpleFooter';
import HideGlobalFooter from './HideGlobalFooter';

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Hide the default full footer from the root layout on the client */}
      <HideGlobalFooter />

      <main>{children}</main>

      <SimpleFooter />
    </>
  );
}
