import Image from "next/image";
import Link from 'next/link';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';

export default function Home() {
  return (
      <div className="flex flex-1 flex-col w-full p-6 justify-center items-center gap-12">
        <div className="flex flex-col max-w-3xl items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Visualization for Social and Ecological Good
          </h1>
          <h4 className="text-lg font-semibold text-black dark:text-zinc-50">
            Recent Developments in Computer Science, Summer 2026<br/>University of Rostock
          </h4>
          <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            We explore recent advances in visualization research and applications, with an emphasis on social and ecological questions.
          </p>
        </div>
        <div className="w-full sm:max-w-3xl flex flex-row gap-6">
          <Image src="/social-good.png" alt="Teaser Social Good" height={650} width={1000} style={{ width: '100%', height: 'auto' }} loading="eager"/>
          <Image src="/environmental-good.png" alt="Teaser Environmental Good" height={650} width={978} style={{ width: '100%', height: 'auto' }}/>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <Link
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            href="/project"
          >
            <FontAwesomeIcon icon={faEye} />
            Explore Project
          </Link>
        </div>
      </div>
  );
}
