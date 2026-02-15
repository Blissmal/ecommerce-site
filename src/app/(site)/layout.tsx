import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "../../stack";
import "../css/euclid-circular-a-font.css";
import "../css/style.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

import { ModalProvider } from "../context/QuickViewModalContext";
import { CartModalProvider } from "../context/CartSidebarModalContext";
import { ReduxProvider } from "@/redux/provider";
import QuickViewModal from "@/components/Common/QuickViewModal";
import CartSidebarModal from "@/components/Common/CartSidebarModal";
import { PreviewSliderProvider } from "../context/PreviewSliderContext";
import PreviewSliderModal from "@/components/Common/PreviewSlider";

import ScrollToTop from "@/components/Common/ScrollToTop";
import { Toaster } from "react-hot-toast";
import { LoaderProvider, LoaderUIWrapper } from "../context/LoadingContext";
import FloatingMessageButton from "@/components/Common/FloatMessageButton";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <StackProvider app={stackServerApp}>
      <StackTheme>
        <LoaderProvider>
          <LoaderUIWrapper>
            <ReduxProvider>
              <CartModalProvider>
                <ModalProvider>
                  <PreviewSliderProvider>
                    <Header />
                    {children}
                    <Footer />
                    
                    {/* Modals */}
                    <QuickViewModal />
                    <CartSidebarModal />
                    <PreviewSliderModal />
                    
                    {/* Global Components */}
                    <ScrollToTop />
                    <FloatingMessageButton />
                    <Toaster />
                  </PreviewSliderProvider>
                </ModalProvider>
              </CartModalProvider>
            </ReduxProvider>
          </LoaderUIWrapper>
        </LoaderProvider>
      </StackTheme>
    </StackProvider>
  );
}