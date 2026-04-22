import Image from "next/image";

export default function Footer() {
    return (
        <footer className="w-full p-4 flex flex-row gap-6 items-center justify-end">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Dr.-Ing. Lena Cibulski
            </p>
            <Image
                src="/va-logo.png"
                alt="VA logo"
                width={75}
                height={50}
            />
            <Image
                src="/vac-logo.png"
                alt="VAC logo"
                width={75}
                height={50}
            />
        </footer>
    )
}