//Send email form input to user's email client

// Guarded — not every page has the contact-us block, and scripts.js loads
// site-wide from the template, not per-page.
const emailForm = document.getElementById('emailForm');
if (emailForm) {
  emailForm.addEventListener('submit', function(event) {
    event.preventDefault();

    // EDIT THESE... This is where you set the recipient and subject.
    const recipient = "support@example.com";
    const subject = "Contact from Website";

    // Grab and sanitize the user's inputs
    const name = encodeURIComponent(document.getElementById('name').value);
    const email = encodeURIComponent(document.getElementById('email').value);
    const comments = encodeURIComponent(document.getElementById('comments').value);

    const emailBody = `Name:  ${name}
    Email: ${email}
    Comments:
    ${comments}

    _______________________
    This message sent from the website.`;

    // Construct the mailto link and trigger user's native email client
    const mailtoUrl = `mailto:${recipient}?subject=${subject}&body=${emailBody}`;
    window.location.href = mailtoUrl;
  });
}

// Mobile nav toggle (header hamburger button) — see template.html's
// #mobile-menu-button/#mobile-menu. Plain click-toggle rather than the
// Tailwind Plus "Elements" <el-disclosure>/command="--toggle" pattern the
// starter shipped with, since that needs the @tailwindplus/elements JS
// library to actually do anything and nothing here ever loaded it.
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
if (mobileMenuButton && mobileMenu) {
  mobileMenuButton.addEventListener('click', function () {
    const isOpen = mobileMenuButton.getAttribute('aria-expanded') === 'true';
    mobileMenuButton.setAttribute('aria-expanded', String(!isOpen));
    mobileMenu.hidden = isOpen;
  });
}