import './App.css'

function App() {
  return (
    <div className="page">
      <header className="header">
        <a href="/" className="wordmark" aria-label="Belac Media home">
          <span className="wordmark-primary">Belac</span>
          <span className="wordmark-secondary">Media</span>
        </a>
      </header>

      <main className="main">
        <section className="hero" aria-labelledby="hero-heading">
          <p className="eyebrow">Narrative · production · presence</p>
          <h1 id="hero-heading">Stories worth telling</h1>
          <p className="lead">
            Belac Media is your partner for thoughtful content, polished production,
            and a brand voice that resonates.
          </p>
          <a className="cta" href="mailto:hello@belacmedia.com">
            Get in touch
          </a>
        </section>
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Belac Media</p>
      </footer>
    </div>
  )
}

export default App
