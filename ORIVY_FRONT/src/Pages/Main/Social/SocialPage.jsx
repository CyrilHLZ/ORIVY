const socialPage = () => {
    
    const [isLoading, setIsLoading] = useState(true);
    const [sorties, setSorties] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSorties = async () => {
            try {
                const response = await fetch('/api/sorties');
                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des sorties');
                }
                const data = await response.json();
                setSorties(data);
                setIsLoading(false);
            } catch (error) {
                console.error('Erreur lors de la récupération des sorties :', error);
                setError('Une erreur est survenue lors de la récupération des sorties.');
                setIsLoading(false);
            }
        };
        fetchSorties();
    }, []);

    return (
        <main className="page-shell social-page">
            <header className="page-heading">
                <p className="eyebrow">Vivre la région</p>
                <h1>Les sorties à ne pas manquer</h1>
            </header>
            {isLoading ? (
                <p>Chargement des sorties...</p>
            ) : error ? (
                <p>{error}</p>
            ) : (
                <section className="sorties-list">
                    {sorties.map((sortie) => (
                        <div key={sortie.id} className="sortie-card">
                            <h2>{sortie.nom}</h2>
                            <p>{sortie.description}</p>
                            <p>Date : {new Date(sortie.date).toLocaleDateString()}</p>
                            <p>Lieu : {sortie.lieu}</p>
                        </div>
                    ))}
                </section>
            )}
        </main>
    );
}

export default socialPage;