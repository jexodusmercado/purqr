import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { QrGeneratorClient } from '@/components/qr-generator/QrGeneratorClient';

export default function Home() {
  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <QrGeneratorClient />
      </main>
      <Footer />
    </>
  );
}
