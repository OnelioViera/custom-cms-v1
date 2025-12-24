// Content models for CMS - Updated with Project content field

import { ObjectId } from 'mongodb';

// Page Model
export interface Page {
  _id?: ObjectId;
  title: string;
  slug: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Project Model
export interface Project {
  _id?: ObjectId;
  title: string;
  slug: string;
  description: string;
  content?: string;
  client?: string;
  startDate?: Date;
  endDate?: Date;
  status: 'planning' | 'in-progress' | 'completed';
  publishStatus: 'draft' | 'published';
  featured: boolean;
  order: number; // Add this line
  images?: string[];
  backgroundImage?: string; // Add this line
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Team Member Model
export interface TeamMember {
  _id?: ObjectId;
  name: string;
  slug: string;
  position: string;
  bio: string;
  email?: string;
  phone?: string;
  image?: string;
  linkedIn?: string;
  order: number;
  status: 'active' | 'inactive';
  publishStatus: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Service Model
export interface Service {
  _id?: ObjectId;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  icon?: string;
  image?: string;
  features: string[];
  order: number;
  status: 'active' | 'inactive';
  publishStatus: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Media Model
export interface Media {
  _id?: ObjectId;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt?: string;
  title?: string;
  folder?: string;
  uploadedBy: string;
  createdAt: Date;
}

// Settings Model
export interface SiteSettings {
  _id?: ObjectId;
  siteName: string;
  siteDescription: string;
  logo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  seo: {
    defaultMetaTitle: string;
    defaultMetaDescription: string;
  };
  updatedAt: Date;
  updatedBy: string;
}
