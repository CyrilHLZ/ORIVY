import { Link } from 'react-router-dom';
import '../Styles/Home/HomePage.css';

const highlights = [
    { number: '01', title: 'Radar local', text: 'Des lieux classés par envie, distance et ambiance pour passer de l’idée au départ.' },
    { number: '02', title: 'Carte vivante', text: 'Restaurants, parcs, villages et points culturels réunis dans une lecture claire.' },
    { number: '03', title: 'Carnet collectif', text: 'Ajoutez vos adresses et composez une mémoire locale qui évolue avec la communauté.' },
];

const signals = [
    { label: 'Lieux indexés', value: '128+' },
    { label: 'Catégories', value: '12' },
    { label: 'Mode carte', value: 'Live' },
];

const collections = [
    { title: 'Sortie douce', tag: 'Promenade', text: 'Un trajet calme, une belle lumière, une adresse pour finir la journée.' },
    { title: 'Soirée précise', tag: 'Restaurants', text: 'Des tables et bars repérés pour choisir vite sans perdre le charme.' },
    { title: 'Culture proche', tag: 'Musées', text: 'Les points d’intérêt à garder sous la main quand l’envie arrive.' },
];

const HomePage = () => (
    <main className="home-page">
        <section className="home-hero">
            <div className="hero-visual" aria-hidden="true">
                <div className="hero-scanline" />
                <div className="hero-note">
                    <span>Signal local</span>
                    <strong>Grenoble et alentours</strong>
                    <small>Adresses, chemins, culture et pauses à portée de main.</small>
                </div>
                <span className="hero-stamp">ORIVY<br /><i>2026</i></span>
            </div>
            <div className="hero-copy">
                <p className="eyebrow hero-eyebrow">Carnet intelligent d’escapades</p>
                <h1>ORIVY</h1>
                <p className="hero-lead">Une interface élégante pour explorer les lieux qui donnent envie de sortir, de goûter, de marcher et de revenir avec une histoire.</p>
                <div className="hero-actions">
                    <Link className="button button-primary" to="/activites">Explorer <span aria-hidden="true">↗</span></Link>
                    <Link className="button button-quiet" to="/carte">Ouvrir la carte</Link>
                </div>
                <div className="hero-signal-grid" aria-label="Indicateurs ORIVY">
                    {signals.map((signal) => (
                        <article className="signal-card" key={signal.label}>
                            <span>{signal.label}</span>
                            <strong>{signal.value}</strong>
                        </article>
                    ))}
                </div>
            </div>
        </section>

        <section className="home-intro">
            <p className="eyebrow">Pourquoi ORIVY</p>
            <h2>Moins chercher.<br /><em>Plus vivre.</em></h2>
            <p>Un guide fluide pour transformer une envie vague en vraie sortie. Les cartes, filtres et contributions gardent le site utile sans perdre son côté sensible.</p>
        </section>

        <section className="highlight-grid">
            {highlights.map((highlight) => (
                <article className="highlight-item" key={highlight.number}>
                    <span>{highlight.number}</span>
                    <h3>{highlight.title}</h3>
                    <p>{highlight.text}</p>
                </article>
            ))}
        </section>

        <section className="collection-band" aria-label="Collections ORIVY">
            <div className="section-heading collection-heading">
                <div>
                    <p className="eyebrow">Sélections</p>
                    <h2>Des parcours qui respirent.</h2>
                </div>
                <Link className="inline-link" to="/activites">Voir les activités <span aria-hidden="true">↗</span></Link>
            </div>
            <div className="collection-grid">
                {collections.map((collection) => (
                    <article className="collection-card" key={collection.title}>
                        <span>{collection.tag}</span>
                        <h3>{collection.title}</h3>
                        <p>{collection.text}</p>
                    </article>
                ))}
            </div>
        </section>

        <section className="home-cta">
            <div>
                <p className="eyebrow">Votre prochain détour</p>
                <h2>Faites confiance à votre curiosité.</h2>
            </div>
            <Link className="round-link" to="/activites" aria-label="Découvrir les activités">↗</Link>
        </section>
    </main>
);

export default HomePage;
