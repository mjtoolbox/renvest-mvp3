import Image from "next/image";
import Link from 'next/link';
import Contactusform from './Contactus';

const Banner = () => {
    return (
        <div className='mx-auto max-w-7xl my-10 sm:py-10 px-6 lg:px-8'>
            <div className='grid grid-cols-1 lg:grid-cols-2 my-16'>

                {/* COLUMN-1 */}

                <div className="mx-auto sm:mx-0">
                    <div className='py-3 text-center lg:text-start'>
                        <button className='text-blue bg-lightblue hover:shadow-xl text-sm md:text-lg font-bold px-6 py-1 rounded-3xl tracking-wider hover:text-white hover:bg-black'>Increase On-Time Rent Payments</button>
                    </div>
                    <div className="py-3 text-center lg:text-start">
                        <h1 className='text-6xl lg:text-80xl font-bold text-darkpurple'>
                            Simplified<br />Landlord Rent<br /> Management
                        </h1>
                    </div>
                    <div className='my-7 text-center lg:text-start'>
                        <div className='flex gap-4 items-center justify-center lg:justify-start'>
                            <Contactusform label="Join Now" buttonClass={'text-sm md:text-xl font-semibold hover:shadow-xl bg-blue text-white py-3 px-6 md:py-5 md:px-14 rounded-full hover:bg-hoblue'} />
                            <Link href="/signup" className='text-sm md:text-xl font-semibold rounded-full bg-white text-blue border border-blue py-3 px-6 md:py-5 md:px-14 hover:bg-lightgrey hover:shadow-md'>
                                Sign Up
                            </Link>
                        </div>
                    </div>
                </div>

                {/* COLUMN-2 */}

                <div className='flex items-center justify-center'>
                    {/* Responsive container: parent is relative and given responsive heights so the SVG scales */}
                    <div className="relative w-full h-44 md:h-64 lg:h-[520px] max-w-lg lg:max-w-none">
                        <Image
                            src="/images/banner/banner.svg"
                            alt="Renvestment banner"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Banner;
