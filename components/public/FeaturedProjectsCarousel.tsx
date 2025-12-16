'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Project {
  _id: string;
  title: string;
  slug: string;
  description: string;
  client?: string;
  images?: string[];
  status: string;
}

interface FeaturedProjectsCarouselProps {
  projects: Project[];
}

export default function FeaturedProjectsCarousel({ projects }: FeaturedProjectsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying || projects.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % projects.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlaying, projects.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % projects.length);
    setIsAutoPlaying(false);
  };

  if (projects.length === 0) return null;

  const currentProject = projects[currentIndex];

  return (
    <div className="relative">
      {/* Main Carousel */}
      <div className="relative h-[600px] bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl overflow-hidden">
        {/* Background Image */}
        {currentProject.images && currentProject.images[0] ? (
          <Image
            src={currentProject.images[0]}
            alt={currentProject.title}
            fill
            className="object-cover opacity-30"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700" />
        )}

        {/* Content Overlay */}
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-3xl text-white">
              {currentProject.client && (
                <p className="text-blue-200 font-medium mb-2">
                  Client: {currentProject.client}
                </p>
              )}
              <h2 className="text-5xl font-bold mb-4">
                {currentProject.title}
              </h2>
              <p className="text-xl text-blue-100 mb-8 line-clamp-3">
                {currentProject.description}
              </p>
              <Link href={`/projects/${currentProject.slug}`}>
                <Button size="lg" variant="default" className="bg-white text-blue-900 hover:bg-blue-50">
                  View Project Details
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {projects.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all"
              aria-label="Previous project"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all"
              aria-label="Next project"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Dots Navigation */}
        {projects.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {projects.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Grid Below Carousel */}
      {projects.length > 1 && (
        <div className="mt-8 grid grid-cols-3 gap-4">
          {projects.map((project, index) => (
            <button
              key={project._id}
              onClick={() => goToSlide(index)}
              className={`relative aspect-video rounded-lg overflow-hidden transition-all ${
                index === currentIndex
                  ? 'ring-4 ring-blue-600 scale-105'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              {project.images && project.images[0] ? (
                <Image
                  src={project.images[0]}
                  alt={project.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold px-2 text-center">
                    {project.title}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                <p className="text-white text-sm font-semibold truncate">
                  {project.title}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
