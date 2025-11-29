# Vercel Deployment Guide

This guide outlines the steps to deploy the Notes App to Vercel.

## Prerequisites

- A [Vercel](https://vercel.com/) account.
- The project pushed to a Git repository (GitHub, GitLab, or Bitbucket).
- A MongoDB database (e.g., MongoDB Atlas).

## Environment Variables

The following environment variables must be configured in your Vercel project settings:

| Variable Name | Description | Value to Enter |
| :--- | :--- | :--- |
| `MONGODB_URI` | The connection string for your MongoDB database. | `mongodb+srv://willam:joseharrywillam123@cluster0.qr7oqoo.mongodb.net/noteapp?appName=Cluster0` |
| `NEXTAUTH_SECRET` | A secret string used to encrypt session data. | Generate a random string (e.g., `openssl rand -base64 32`) or use a long random password. |
| `NEXTAUTH_URL` | The canonical URL of your site. | `https://your-project-name.vercel.app` (Replace with your actual Vercel URL) |

> [!IMPORTANT]
> You **MUST** add these environment variables in your Vercel project settings under **Settings > Environment Variables**. The application will **fail to start** without them.

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
