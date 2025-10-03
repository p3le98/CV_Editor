import { Button } from './ui/button';
import { Card } from './ui/card';
import { useNavigate } from 'react-router-dom';

export const LandingPage = () => {
  const navigate = useNavigate();

  const handleCreateNew = () => {
    navigate('/editor');
  };

  const handleUpload = () => {
    navigate('/editor', { state: { action: 'upload' } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="mb-6 text-4xl font-bold text-gray-900 sm:text-6xl">
            Erstellen Sie Ihren professionellen Lebenslauf
          </h1>
          <p className="mb-8 text-xl text-gray-600">
            Einfach, schnell und mit KI-Unterstützung zu Ihrem perfekten Lebenslauf
          </p>
          <div className="mb-16 flex justify-center space-x-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateNew}>
              Neuen Lebenslauf erstellen
            </Button>
            <Button size="lg" variant="outline" onClick={handleUpload}>
              Lebenslauf hochladen
            </Button>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <Card className="p-6">
            <h3 className="mb-3 text-xl font-semibold">Moderne Vorlagen</h3>
            <p className="text-gray-600">
              Professionelle und ATS-freundliche Vorlagen für jeden Beruf
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="mb-3 text-xl font-semibold">KI-Assistent</h3>
            <p className="text-gray-600">
              Intelligente Vorschläge zur Optimierung Ihres Lebenslaufs
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="mb-3 text-xl font-semibold">Einfacher Export</h3>
            <p className="text-gray-600">
              Exportieren Sie Ihren Lebenslauf im PDF-Format in höchster Qualität
            </p>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <h2 className="mb-8 text-3xl font-bold">So funktioniert es</h2>
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 text-4xl font-bold text-blue-600">1</div>
              <h3 className="mb-2 font-semibold">Vorlage wählen</h3>
              <p className="text-sm text-gray-600">
                Wählen Sie aus unseren professionellen Vorlagen
              </p>
            </div>
            <div>
              <div className="mb-4 text-4xl font-bold text-blue-600">2</div>
              <h3 className="mb-2 font-semibold">Daten eingeben</h3>
              <p className="text-sm text-gray-600">
                Fügen Sie Ihre persönlichen und beruflichen Informationen hinzu
              </p>
            </div>
            <div>
              <div className="mb-4 text-4xl font-bold text-blue-600">3</div>
              <h3 className="mb-2 font-semibold">KI-Optimierung</h3>
              <p className="text-sm text-gray-600">
                Lassen Sie die KI Ihren Lebenslauf verbessern
              </p>
            </div>
            <div>
              <div className="mb-4 text-4xl font-bold text-blue-600">4</div>
              <h3 className="mb-2 font-semibold">Exportieren</h3>
              <p className="text-sm text-gray-600">
                Laden Sie Ihren fertigen Lebenslauf herunter
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 