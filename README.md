
### Deliverables
CS4241 Final Project - Team S - Brigham & Womens Web Application

Our web application was designed for visitors and users at Brigham & Womens. As a user you have the ability to see all services associated with the hospital as well 
as find directios to certain common areas within the hospital. This includes the lobby, parking, and drop-off zones. As a signed in user, you have the ability to create
and edit services and sites. With this functionality, hospital staff are able to reorganize services and edit them easily. Users have the ability to 'mark your car' 
which is helpful to be able to navigate to and from the lobby to a users vehicle. When creating a new site, there is a pop-up map where a user can place pins for the 
lobby, drop-off, and parking. This allows signed-in users to easliy edit/add sites.

The link for our deployed web application is:
https://final-project-storm-strikers.vercel.app

Challenges:

When developing we ran into some challenges. One of the big challenges our team faced was integrating the Google Maps API. Although we had some functionalities working 
for the services and sites, to navigate to the lobby and find locations was challenging. Another challenge we ran into was the overlay for the buildings. We had some png
of the hospital's main floor layout. This was so a user could naviage to the lobby and the building floor plan would be overlayed on top of the gooogle maps.

Tech Stack & Installation:

WebStorm Run Configurations
Use the provided run configuration— Start Dev — to interact with the repository via WebStorm. This configuration is customized to properly connect the repository to WebStorm. Running files directly or outside of these configurations may lead to unexpected results.
Using the Dev configuration, the development servers will automatically restart when a file change occurs.
If a restart does not occur, use CMD + S / CTRL + S to manually save the file and trigger the restart.

Setup & Installation

Installation and Useful Scripts
Run pnpm install to install all packages.

Run pnpm lint to validate your code content and style.

run pnpm format to format the code.

Run pnpm run dev to start the development server.

Run pnpm run build to generate a production build.


If your commits are failing, run pnpm run lint and examine the output to find the error(s). Address them, and your commit will proceed.

Package Overview

What follows is a basic overview of the packages in the repo, and what files they use.

TypeScript

JavaScript is a dynamically-typed language, meaning it does not need types explicitly specified in code, as they are determined at runtime. It can also introduce bugs that would normally be caught at compile-time.

Typescript solves this by requiring that type annotations be placed on variables, method parameters, and method returns. These are often automatically inferred, so tedious boilerplate is reduced.

Typescript compiles to JavaScript, catching any type errors in the process.

Typescript is configured by tsconfig.json. You SHOULD NEVER edit the top-level one directly, as it simply refers to the typescript config project in configs. It exists at the top-level for the benefit of your IDE, and links to the above project. You probably won't need to modify the Typescript config at all. Each package contains its own tsconfig.json that extends the base one, and provides some specific information about its environment (for instance, web based or client based, and how packages are resolved).

See https://www.typescriptlang.org/docs/ for information on TypeScript and its types.

Next.js

Next.js is a React framework that enables server-side rendering (SSR), static site generation (SSG), and API routing. It provides optimized performance, automatic code-splitting, and routing out of the box.

In this project, Next.js is configured using next.config.js, which manages settings like API routes, environment variables, and build optimizations.

MongoDB

MongoDB is a NoSQL database used to store hospital building locations, services, and parking data. It is schema-less and allows for flexible data modeling.

In this project, MongoDB is accessed using Mongoose, an ODM (Object Data Modeling) library for Node.js that simplifies interactions with MongoDB.

MongoDB connection settings are managed in .env.local, and database operations are handled in the /src/utils/db.ts file.

Auth.js (NextAuth)

Auth.js (formerly NextAuth.js) is an authentication library for Next.js that supports various providers, including GitHub OAuth.

This project uses NextAuth for admin authentication, ensuring that only authorized users can manage hospital data.

Authentication settings are defined in /src/pages/api/auth/[...nextauth].ts, and environment variables related to authentication are stored in .env.local.

Google Maps API (@vis.gl/react-google-maps)

Google Maps API provides interactive map functionality, including search, directions, and location markers.

This project uses the @vis.gl/react-google-maps package for rendering maps and adding hospital sites, services, parking areas, and navigation routes.

API keys are configured in .env.local, and the implementation can be found in /src/components/Map.tsx.

ShadCN

Shadcn UI is a customizable, responsive UI library that allows developers to build modern web interfaces. Unlike other libraries, Shadcn UI allows downloading individual UI components' source code into your codebase

ESLint

ESLint is a linter for JavaScript/TypeScript that checks for errors and enforces code style guidelines.
The configuration is defined in .eslintrc.cjs. You SHOULD NEVER modify the top-level .eslintrc.cjs file directly—it exists only for IDE support and imports project-specific settings.

Details on ESLint can be found here: https://eslint.org/docs/latest/

Prettier

Prettier is a code formatter for JavaScript/TypeScript that enforces consistent style rules, such as indentation and semicolon usage.
The configuration is defined in .prettierrc.cjs. Like ESLint, you SHOULD NOT modify the top-level or project-level configs directly.
To format code automatically, use: pnpm run format

See https://prettier.io/docs/en/index.html for details on how to configure Prettier.

Husky

Husky is a tool that integrates with Git hooks, enabling automated tasks before committing code.

In this project, Husky runs pnpm run lint:fix before each commit to ensure that ESLint and Prettier checks pass.

If you absolutely need to skip the autochecks, you can run git commit --no-verify

Husky's config is in .husky, with an auto-install script in package.json.

You probably won't need to touch your Husky config.

See https://typicode.github.io/husky/ for details.

pnpm

pnpm is a fast package manager that optimizes dependency management by using symlinked modules instead of duplicating files. It is used instead of npm or yarn for better performance.

To install dependencies using pnpm, run: pnpm install


Group Memeber Contributions:

Ian:
  - Site table
  - Optimistic state on site/service tables
  - ComboBox and MultiSelect form components
  - repo setup
  - Navigation from parking/dropoff to lobby
  - map image overlay

Emerson:
  - Auth
  - Home page
  - Services table
  - Handled location based actions like button showing for drop off

Dee
  - Find Parking/Drop Off button
  - Mark car's location & Guide to the marked car

Alek:
  - Sevice edit functionlity
  - Service delete functioity
  - Primary lobby navigation.
  - Dialog styling

Link to Video Demo:
https://wpi0-my.sharepoint.com/:v:/g/personal/irwright_wpi_edu/EfL1A3OTrylIjznRePWbFOUBoQGqaR7iIWd3dy_WBgZeFw?e=2bZT6x
