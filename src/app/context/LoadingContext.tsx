"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import PreLoader from "@/components/Common/PreLoader"; // Ensure this path matches your file structure

interface LoaderContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export const LoaderProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <LoaderContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error("useLoader must be used within a LoaderProvider");
  }
  return context;
};

// This component handles the UI logic: showing the loader vs showing the content
export const LoaderUIWrapper = ({ children }: { children: ReactNode }) => {
  const { isLoading } = useLoader();

  return (
    <>
      {isLoading && <PreLoader />}
      <div
        className={`transition-opacity duration-500 ease-in-out ${
          isLoading ? "opacity-0 h-0 overflow-hidden" : "opacity-100"
        }`}
      >
        {children}
      </div>
    </>
  );
};