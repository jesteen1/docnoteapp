# Vercel Deployment Guide

This guide outlines the steps to deploy the Notes App to Vercel.

## Prerequisites

- A [Vercel](https://vercel.com/) account.
- The project pushed to a Git repository (GitHub, GitLab, or Bitbucket).
- A MongoDB database (e.g., MongoDB Atlas).

## Environment Variables

The following environment variables must be configured in your Vercel project settings:

| Variable Name | Description | Example |
| :--- | :--- | :--- |
| `MONGODB_URI` | The connection string for your MongoDB database. | `mongodb+srv://<user>:<password>@cluster.mongodb.net/notes-app` |
| `NEXTAUTH_SECRET` | A secret string used to encrypt session data. | `your-secret-key` |
| `NEXTAUTH_URL` | The canonical URL of your site (required for production). | `https://your-project.vercel.app` |

> [!IMPORTANT]
> Ensure `NEXTAUTH_URL` is set to your Vercel deployment URL in production.

## Deployment Steps

1.  **Import Project**: Log in to Vercel and click "Add New..." -> "Project". Import your Git repository.
2.  **Configure Project**:
    *   **Framework Preset**: Next.js (should be detected automatically).
    *   **Root Directory**: `./` (default).
    *   **Build Command**: `next build` (default).
    *   **Output Directory**: `.next` (default).
    *   **Install Command**: `npm install` (default).
3.  **Add Environment Variables**: Expand the "Environment Variables" section and add the variables listed above.
4.  **Deploy**: Click "Deploy". Vercel will build and deploy your application.

## Troubleshooting

-   **Build Errors**: Check the build logs in the Vercel dashboard.
-   **Database Connection**: Ensure your MongoDB cluster allows connections from Vercel (allow access from anywhere `0.0.0.0/0` or whitelist Vercel IP addresses).
