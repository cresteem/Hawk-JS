<div align="center">

![HAWK.js logo](./logo/logo.webp)

# Hawk.js - Advanced Sitemap Generator & SEO Automation Tool

<p id="intro">Hawk.js is an advanced, open-source sitemap generator and SEO automation tool designed to enhance your website's search engine visibility. It automates the creation of comprehensive sitemaps and simplifies their submission to major search engines such as Google, Bing, Yahoo, Yandex, and more. With support for multiple indexing strategies like IndexNow and Google Webmaster Tools, Hawk.js ensures your website is indexed accurately and quickly, driving better SEO performance.</p>


### Supported Platforms

[![Linux](https://img.shields.io/badge/Linux-FCC624?style=for-the-badge&logo=linux&logoColor=black)]()
[![Windows](https://img.shields.io/badge/Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white)]()
[![Node JS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)]()

### Continuous integration Support
![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white)
![GitLab CI](https://img.shields.io/badge/gitlab%20ci-%23181717.svg?style=for-the-badge&logo=gitlab&logoColor=orange)

---

<p>

<span>
  <a href="https://github.com/cresteem/Hawk-JS/commits/main">
    <img src="https://img.shields.io/github/last-commit/cresteem/Hawk-JS?display_timestamp=committer&style=for-the-badge&label=Updated%20On" alt="GitHub last commit"/>
  </a>
</span>

<span>
  <a href="">
    <img src="https://img.shields.io/github/commit-activity/m/cresteem/Hawk-JS?style=for-the-badge&label=Commit%20Activity" alt="GitHub commit activity"/>
  </a>
</span>

</p>

<p>

<span>
  <a href="https://github.com/cresteem/Hawk-JS/actions/workflows/test.yaml">
    <img src="https://img.shields.io/github/actions/workflow/status/cresteem/Hawk-JS/test.yaml?style=for-the-badge&label=Test%20Status" alt="GitHub Actions Test Status"/>
  </a>
</span>

</p>

---

<p>

<span>
  <a href="LICENSE">
    <img src="https://img.shields.io/github/license/cresteem/Hawk-JS?style=for-the-badge&label=License" alt="GitHub License"/>
  </a>
</span>

<span>
  <a href="https://github.com/cresteem/Hawk-JS/releases">
    <img src="https://img.shields.io/github/v/release/cresteem/Hawk-JS?sort=date&display_name=tag&style=for-the-badge&label=Latest%20Version" alt="GitHub Release"/>
  </a>
</span>

</p>

<p>

<span>
  <a href="https://www.codefactor.io/repository/github/cresteem/Hawk-JS/issues/main">
    <img src="https://img.shields.io/codefactor/grade/github/cresteem/Hawk-JS?style=for-the-badge&label=Code%20Quality%20Grade" alt="CodeFactor Grade"/>
  </a>
</span>

</p>

---

<p>

<span>
  <a href="">
    <img src="https://img.shields.io/npm/d18m/%40cresteem/hawk-js?style=for-the-badge&label=Downloads%20On%20NPM" alt="NPM Downloads"/>
  </a>
</span>

<span>
  <a href="">
    <img src="https://img.shields.io/github/stars/cresteem/Hawk-JS?style=for-the-badge&label=Stars" alt="GitHub Repo stars"/>
  </a>
</span>

</p>

---

<p>

<span>
  <a href="https://github.com/sponsors/darsan-in">
    <img src="https://img.shields.io/github/sponsors/darsan-in?style=for-the-badge&label=Generous%20Sponsors" alt="GitHub Sponsors"/>
  </a>
</span>

</p>

---

</div>

## Table of Contents 📝

- [Features and Benefits](#features-and-benefits-)
- [Use Cases](#use-cases-)
- [Friendly request to users](#-friendly-request-to-users)

- [Installation - Step-by-Step Guide](#installation---step-by-step-guide-)
- [Usage](#usage)

- [License](#license-%EF%B8%8F)
- [Contributing to Our Project](#contributing-to-our-project-)
- [Website](#website-)

- [Contact Information](#contact-information)
- [Credits](#credits-)

## Features and Benefits ✨

* **Automation**: Streamlines the generation and submission of sitemaps, saving time and reducing manual effort.
* **SEO Optimization**: Ensures your website is indexed by all search engines possible, improving visibility and ranking.
* **Customization**: Offers advanced configuration options to tailor sitemap generation to your specific needs.
* **Real-Time Updates**: Keeps your sitemaps up-to-date with the latest changes to your site.
* **Multi-Engine Support**: Automatically submits your sitemaps to a variety of search engines, expanding your reach.
  * Supports multiple strategies such as **IndexNow**, **Google Webmaster Tools**, **Google Indexing**, and many others, ensuring comprehensive coverage for all major search engines across the internet.
* **CI/CD Integration**: Can be easily integrated into Continuous Integration (CI) pipelines like GitHub Actions and GitLab CI, automating sitemap management within your deployment workflow.
* **Open-Source**: Licensed under Apache 2.0, allowing free use for both personal and commercial projects.

### New Features in Version 1.5.0:
* **Logo in VSCode Configuration File**: Adds the official logo to the VSCode configuration for better project branding.
* **TypeScript Support for Custom Config Files**: The `init` command now supports creating custom configuration files with TypeScript support.
* **Removal of Secret Loader from CLI**: The secret loader has been removed from the CLI to improve security and simplify functionality.
* **Default Lookup and Ignore Patterns**: The default lookup and ignore patterns are now loaded directly from the configuration for both API and CLI by default.
* **`node_modules` Folder Ignored Indefinitely**: The `node_modules` folder is now ignored indefinitely in all operations, reducing unnecessary processing.
* **Switch from `http.request` to `fetch()`**: The usage of `http.request` has been replaced with the `fetch()` API to simplify the code and optimize for better performance and readability.
* **Code Refactoring and Optimization**: Significant code improvements and optimizations have been made for better performance and maintainability.
* **Configurable FTP Credentials**: FTP credentials are now configurable, with environment variable fallback if not provided.
* **Updated and Optimized Test Cases**: Test cases have been updated and optimized for better coverage and accuracy.
* **Removal of Unwanted Dependencies**: Unnecessary dependencies have been removed to streamline the project and improve performance.
* **Enhanced CLI Functionality**: Various enhancements to the CLI for improved user interaction and functionality.
* **Updated All Dependencies**: All dependencies have been updated to their latest stable versions to ensure better security and performance.
* **Official Logo Added**: The official Hawk.js logo has been integrated into the project for better recognition and branding.
* **Configuration Style Changed to JavaScript**: The configuration style has been changed from JSON to JavaScript for greater flexibility.

### Removed Features:
* **Secret Loader**: The secret loader functionality has been completely removed from the CLI, simplifying the interface and improving security.

## Use Cases ✅

* **Web Developers**: Automate sitemap generation for projects, streamlining the SEO process and ensuring consistent updates across various search engines.
* **SEO Professionals**: Improve website visibility by ensuring efficient and accurate indexing across multiple search engines, including Google, Bing, Yahoo, Yandex, and more.
* **Digital Marketers**: Ensure that content is always up-to-date in search engine indexes by automating sitemap submissions through various strategies such as **IndexNow** and **Google Webmaster Tools**.
* **Large Websites**: Manage frequent updates and real-time sitemap generation for large-scale websites, ensuring that changes are reflected immediately in search engines.
* **E-commerce Sites**: Efficiently handle large numbers of pages and products, ensuring they are indexed and visible on all major search engines with minimal manual intervention.
* **Blogs and Content-Heavy Sites**: Ensure better search engine indexing and visibility for content-rich sites that require frequent updates and real-time indexing.
* **Sites Requiring Multiple Indexing Strategies**: Leverage various indexing strategies like **IndexNow**, **Google Indexing**, and **Google Webmaster Tools** for comprehensive search engine reach.
* **Continuous Integration Users**: Integrate with CI/CD pipelines (e.g., GitHub Actions, GitLab CI) to automate sitemap management alongside deployment workflows.


---

### 🙏🏻 Friendly Request to Users

Every star on this repository is a sign of encouragement, a vote of confidence, and a reminder that our work is making a difference. If this project has brought value to you, even in the smallest way, **please consider showing your support by giving it a star.** ⭐

_"Star" button located at the top-right of the page, near the repository name._

Your star isn’t just a digital icon—it’s a beacon that tells us we're on the right path, that our efforts are appreciated, and that this work matters. It fuels our passion and drives us to keep improving, building, and sharing.

If you believe in what we’re doing, **please share this project with others who might find it helpful.** Together, we can create something truly meaningful.

Thank you for being part of this journey. Your support means the world to us. 🌍💖

---

## Installation - Step-by-Step Guide 🪜
Follow Below link:

[Getting Started with Hawk.js](https://hawkjs.cresteem.com/getting-started-with-hawk-js)


## Usage

Everything you need to know about using Hawk.js—whether it's setting up, configuring, integrating with CI/CD pipelines, or exploring advanced features—is available on the official website. Visit [hawkjs.cresteem.com](https://hawkjs.cresteem.com/) for:

- **Getting Started**: Step-by-step guide to set up and configure Hawk.js for your project.
- **CI/CD Integration**: Detailed instructions on how to integrate Hawk.js into your GitHub Actions, GitLab CI, or other CI/CD workflows.
- **Advanced Features**: In-depth explanations of the features like **IndexNow**, **Google Webmaster Tools**, and **real-time sitemap updates**.
- **Full Documentation**: Comprehensive reference documentation covering all commands, configuration options, and use cases.

Visit [hawkjs.cresteem.com](https://hawkjs.cresteem.com/) for complete guidance and support.


## License ©️

This project is licensed under the [Apache License 2.0](LICENSE).

## Contributing to Our Project 🤝

We’re always open to contributions and fixing issues—your help makes this project better for everyone.

If you encounter any errors or issues, please don’t hesitate to [raise an issue](../../issues/new). This ensures we can address problems quickly and improve the project.

For those who want to contribute, we kindly ask you to review our [Contribution Guidelines](CONTRIBUTING) before getting started. This helps ensure that all contributions align with the project's direction and comply with our existing [license](LICENSE).

We deeply appreciate everyone who contributes or raises issues—your efforts are crucial to building a stronger community. Together, we can create something truly impactful.

Thank you for being part of this journey!

## Website 🌐

<a id="url" href="https://hawkjs.cresteem.com">hawkjs.cresteem.com</a>

## Contact Information

For any questions, please reach out via connect@cresteem.com

## Credits 🙏🏻

Hawk.js is developed and maintained by [DARSAN](https://darsan.in/) at [CRESTEEM](https://cresteem.com/).

---

<p align="center">
  <a href="https://cresteem.com/">
    <img src="https://darsan.in/readme-src/branding-gh.png" alt="Cresteem Logo">
  </a>
</p>

---

<p align="center">

<span>
<a href="https://www.instagram.com/cresteem/"><img width='45px' height='45px' src="https://darsan.in/readme-src/footer-icons/insta.png" alt="Cresteem at Instagram"></a>
</span>

<span>
  <img width='20px' height='20px' src="https://darsan.in/readme-src/footer-icons/gap.png" alt="place holder image">
</span>

<span>
<a href="https://www.linkedin.com/company/cresteem/"><img width='45px' height='45px' src="https://darsan.in/readme-src/footer-icons/linkedin.png" alt="Cresteem at Linkedin"></a>
</span>

<span>
  <img width='20px' height='20px' src="https://darsan.in/readme-src/footer-icons/gap.png" alt="place holder image">
</span>

<span>
<a href="https://x.com/cresteem"><img width='45px' height='45px' src="https://darsan.in/readme-src/footer-icons/x.png" alt="Cresteem at Twitter / X"></a>
</span>

<span>
  <img width='20px' height='20px' src="https://darsan.in/readme-src/footer-icons/gap.png" alt="place holder image">
</span>

<span>
<a href="https://www.youtube.com/@Cresteem"><img width='45px' height='45px' src="https://darsan.in/readme-src/footer-icons/youtube.png" alt="Cresteem at Youtube"></a>
</span>

<span>
  <img width='20px' height='20px' src="https://darsan.in/readme-src/footer-icons/gap.png" alt="place holder image">
</span>

<span>
<a href="https://github.com/cresteem"><img width='45px' height='45px' src="https://darsan.in/readme-src/footer-icons/github.png" alt="Cresteem at Github"></a>
</span>

<span>
  <img width='20px' height='20px' src="https://darsan.in/readme-src/footer-icons/gap.png" alt="place holder image">
</span>

<span>
<a href="https://cresteem.com/"><img width='45px' height='45px' src="https://darsan.in/readme-src/footer-icons/website.png" alt="Cresteem Website"></a>
</span>

</p>

---

#### Topics

<ul id="keywords">
<li>SEO automation</li>
<li>sitemap generator</li>
<li>SEO tools</li>
<li>web development</li>
<li>site indexing</li>
<li>open-source</li>
<li>search engines</li>
<li>Google SEO</li>
<li>Bing SEO</li>
<li>IndexNow</li>
<li>real-time updates</li>
<li>webmaster tools</li>
<li>content management</li>
<li>digital marketing</li>
</ul>
