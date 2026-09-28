import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './components/PublicLayout.jsx';
import { Loader } from './components/ui.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Capabilities from './pages/Capabilities.jsx';
import Quality from './pages/Quality.jsx';
import Facilities from './pages/Facilities.jsx';
import Leadership from './pages/Leadership.jsx';
import News from './pages/News.jsx';
import NewsDetail from './pages/NewsDetail.jsx';
import Careers from './pages/Careers.jsx';
import JobDetail from './pages/JobDetail.jsx';
import Gallery from './pages/Gallery.jsx';
import Contact from './pages/Contact.jsx';
import StaticPage from './pages/StaticPage.jsx';
import NotFound from './pages/NotFound.jsx';

const Admin = lazy(() => import('./admin/AdminApp.jsx'));

export default function App() {
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<Loader full />}>
            <Admin />
          </Suspense>
        }
      />
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:slug" element={<ProductDetail />} />
        <Route path="capabilities" element={<Capabilities />} />
        <Route path="capabilities/:slug" element={<Capabilities />} />
        <Route path="quality" element={<Quality />} />
        <Route path="facilities" element={<Facilities />} />
        <Route path="facilities/:slug" element={<Facilities />} />
        <Route path="leadership" element={<Leadership />} />
        <Route path="news" element={<News />} />
        <Route path="news/:slug" element={<NewsDetail />} />
        <Route path="careers" element={<Careers />} />
        <Route path="careers/:slug" element={<JobDetail />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy-policy" element={<StaticPage slug="privacy-policy" />} />
        <Route path="terms" element={<StaticPage slug="terms" />} />
        <Route path="pages/:slug" element={<StaticPage />} />
        <Route path="home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
