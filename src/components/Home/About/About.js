import React from 'react';

// import team pictures
import cc from '../../../assets/home/team/cc.png';

function About() {
    return (
        <div id="about">
            <section id="fh5co-about" data-section="about">
                <div class="container">
                    <div class="row">
                        <div class="col-md-12 section-heading text-center">
                            <h2 class="to-animate">Equipa</h2>
                            <div class="row">

                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-3">
                            <div className="fh5co-person text-center to-animate">
                                <figure><img src={cc} alt="Image" /></figure>
                                <h3>Alexandre Lopes</h3>
                                <ul className="social social-circle">

                                </ul>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="fh5co-person text-center to-animate">
                                <figure><img src={cc} alt="Image" /></figure>
                                <h3>André Amarante</h3>
                                <ul className="social social-circle">

                                </ul>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="fh5co-person text-center to-animate">
                                <figure><img src={cc} alt="Image" /></figure>
                                <h3>Edgar Morais</h3>
                                <ul className="social social-circle">

                                </ul>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="fh5co-person text-center to-animate">
                                <figure><img src={cc} alt="Image"/></figure>
                                <h3>Francisco Fontinha</h3>
                                <ul className="social social-circle">

                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>

    );
}

export default About;
