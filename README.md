# Lively Business Showcase

here's a previously created website from lovable. we need to edit and update it to look more like an active business thats ticking -- this includes showing a picture carousal on the home page that shows recent events and photographs of the business in action (use \public\site\assets - just use 2026-11-01-party.jpg as placeholder we can edit later).
it should be a simple full width sliding & repeat/looping, with a small caption with the date & name : to be parsed from the filename like 12 Nov, 2026 - party (from  2026-11-01-party.jpg). if needed we could make a little file that has this detail, like carousal_images.js containing images = [  "2026-11-01-party.jpg" ,  " 2026-11-02-meetup.jpg" , ... ] ; and use that to load images?  this is only to be done on the homepage (/public/site/index.html).


another thing is that this is currently a lovable project, and doesnt work offline / without a local server. we need to make it a static site with just html+css+js. is that possible? or do we need to keep it server dependent for any features? preferable to keep it plain css+js+html files that can be worked on offline without a http server, making it easier for novices to edit update and view in browser (without local server). 

then we also need to update the course pages and other pages with new info from a few flyers / brochures (pdfs) we have made. should i send those to you?

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/feb3b0f9-3c32-4b9e-b4ae-800f0f05ae79).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
