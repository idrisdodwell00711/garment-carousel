import GarmentCarousel from './components/GarmentCarousel'
import './style.css'

export default function App() {
  return (
    <main className="min-h-screen">
      <header className="site-header">
        <a className="brand-mark" href="#top" aria-label="Archive home">ARCHIVE<span>®</span></a>
        <nav aria-label="Main navigation"><a href="#collection">COLLECTION</a><a href="#about">ABOUT</a></nav>
        <a className="header-bag" href="#collection">THE EDIT <span>04</span></a>
      </header>
      <div id="top" className="hero-strip"><span>CURATED OUTERWEAR / VOL. 01</span><span>INDEPENDENT STYLE, CONSIDERED.</span></div>
      <div id="collection"><GarmentCarousel /></div>
      <footer id="about" className="site-footer"><span>ARCHIVE® — A STUDY IN EVERYDAY ICONS</span><span>DESIGNED TO BE DISCOVERED.</span></footer>
    </main>
  )
}
