import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Services } from "./pages/Services";
import { Contact } from "./pages/Contact";
import { RequestService } from "./pages/RequestService";
import { WebDevelopment } from "./pages/services/WebDevelopment";
import { MobileDevelopment } from "./pages/services/MobileDevelopment";
import { ManagementSoftware } from "./pages/services/ManagementSoftware";
import { HRSoftware } from "./pages/services/HRSoftware";
import { WhatsappAutomation } from "./pages/services/WhatsappAutomation";
import { BusinessAutomation } from "./pages/services/BusinessAutomation";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="services" element={<Services />} />
        <Route path="services/web-development" element={<WebDevelopment />} />
        <Route path="services/mobile-development" element={<MobileDevelopment />} />
        <Route path="services/management-software" element={<ManagementSoftware />} />
        <Route path="services/hr-software" element={<HRSoftware />} />
        <Route path="/services/whatsapp-automation" element={<WhatsappAutomation />} />
        <Route path="/services/business-automation" element={<BusinessAutomation />} />
        <Route path="/request-service" element={<RequestService />} />
        <Route path="/contact" element={<Contact />} />
      </Route>
    </Routes>
  );
}

export default App;
