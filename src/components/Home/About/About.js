import React from 'react';

// import team pictures
import cc from '../../../assets/home/team/cc.png';
import orientador from '../../../assets/home/team/orientador.jpg';
import membro1 from '../../../assets/home/team/membro1.jpg';
import membro2 from '../../../assets/home/team/membro2.jpg';
import membro3 from '../../../assets/home/team/membro3.jpg';
import membro4 from '../../../assets/home/team/membro4.jpg';




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
                    <div className="col-md-4">
                    </div>
                    <div className="col-md-4">
                        <div className="fh5co-person text-center to-animate">
                            <figure><img src={orientador} alt="Image" /></figure>
                            <h3>Diogo Gomes</h3>
                            <span>Orientador do projeto</span>
                            <ul className="social social-circle">

                            </ul>
                        </div>
                    </div>
                    <div className="col-md-12">
                        <h3></h3>
                    </div>
                    <div className="col-md-12">
                        <h3></h3>
                    </div>
                    <div className="col-md-12">
                        <h3></h3>
                    </div>
                    <div className="row">
                        <div className="col-md-3">
                            <div className="fh5co-person text-center to-animate">
                                <figure><img src={membro1} alt="Image" /></figure>
                                <h3>Alexandre Lopes</h3>
                                <ul className="social social-circle">

                                </ul>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="fh5co-person text-center to-animate">
                                <figure><img src={membro4} alt="Image" /></figure>
                                <h3>André Amarante</h3>
                                <ul className="social social-circle">

                                </ul>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="fh5co-person text-center to-animate">
                                <figure><img src={membro3} alt="Image" /></figure>
                                <h3>Edgar Morais</h3>
                                <ul className="social social-circle">

                                </ul>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="fh5co-person text-center to-animate">
                                <figure><img src={membro2} alt="Image"/></figure>
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
