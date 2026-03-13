import { Helmet } from 'react-helmet-async';

const StructuredData = () => {
    const schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "GitExplorer",
        "description": "A professional GitHub profile and repository explorer with statistics, trending repositories, and developer comparisons.",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Web",
        "url": "https://github-profile-explorer-gamma.vercel.app/",
        "image": "https://github-profile-explorer-gamma.vercel.app/og-image.png",
        "author": {
            "@type": "Person",
            "name": "GitExplorer Team"
        },
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "featureList": [
            "GitHub Profile Search",
            "Repository Explorer",
            "Contribution Heatmap",
            "Trending Repositories",
            "User Comparison",
            "Code Search"
        ]
    };

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(schema)}
            </script>
        </Helmet>
    );
};

export default StructuredData;
