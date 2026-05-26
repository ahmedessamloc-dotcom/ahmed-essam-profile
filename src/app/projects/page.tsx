import React, { Suspense } from 'react';
import ProjectsSection from '@/components/sections/ProjectsSection';

export default function ProjectsPage() {
  return (
    <div className="pt-16">
      <Suspense>
        <ProjectsSection />
      </Suspense>
    </div>
  );
}
