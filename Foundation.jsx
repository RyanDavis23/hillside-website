function Foundation() {
  return (
    <section id="about" className="section bg-cream about" data-screen-label="02 About Hillside">
      <figure className="about__photo">
        <img
          src="./assets/photos/tyler-portrait.webp"
          alt="Tyler Gwozdz, smiling at his 21st birthday."
          loading="lazy"
        />
        <figcaption>Tyler Gwozdz</figcaption>
      </figure>

      <div className="container about__copy">
        <span className="label">About</span>
        <h2 className="about__headline">
          Built in memory of Tyler. Making others a part of his legacy.
        </h2>
        <p className="lede">
          Tyler Gwozdz was a son, a brother, and a best friend. We lost him to addiction in January 2020. In the years since, his family and the friends who loved him have kept his memory alive by helping the people still fighting.
        </p>
      </div>
    </section>
  );
}

window.Foundation = Foundation;
