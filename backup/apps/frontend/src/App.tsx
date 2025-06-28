import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navigation from './components/layout/Navigation';
import ClientsPage from './pages/clients';
import CreateClientPage from './pages/clients/create';
import ClientDetailsPage from './pages/clients/[id]';
import EditClientPage from './pages/clients/[id]/edit';
import OrdersPage from './pages/orders';
import ProjectsPage from './pages/projects';
import CreateProjectPage from './pages/projects/create';
import ProjectPhasesPage from './pages/projects/[id]/phases';
import PhaseVariantsPage from './pages/projects/[id]/phases/[phaseId]/variants';
import VariantRoomsPage from './pages/projects/[id]/phases/[phaseId]/variants/[variantId]/rooms';
import OffersPage from './pages/offers';
import CreateOfferPage from './pages/offers/create';
import OfferDetailsPage from './pages/offers/[id]';
import EditOfferPage from './pages/offers/[id]/edit';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main>
            <Routes>
              <Route path="/" element={<ClientsPage />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/clients/create" element={<CreateClientPage />} />
              <Route path="/clients/:id" element={<ClientDetailsPage />} />
              <Route path="/clients/:id/edit" element={<EditClientPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/create" element={<CreateProjectPage />} />
              <Route path="/projects/:id/phases" element={<ProjectPhasesPage />} />
              <Route path="/projects/:id/phases/:phaseId/variants" element={<PhaseVariantsPage />} />
              <Route path="/projects/:id/phases/:phaseId/variants/:variantId/rooms" element={<VariantRoomsPage />} />
              <Route path="/offers" element={<OffersPage />} />
              <Route path="/offers/create" element={<CreateOfferPage />} />
              <Route path="/offers/:id" element={<OfferDetailsPage />} />
              <Route path="/offers/:id/edit" element={<EditOfferPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App; 