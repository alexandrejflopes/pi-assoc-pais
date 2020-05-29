import React from 'react';
import logo_react from '../../../assets/home/logo_react.png';
import logo_firebase from '../../../assets/home/logo_firebase.png';

function Services() {
    return (
        <div id="services">
            <section id="fh5co-services" data-section="services">
                <div class="container">
                    <div class="row">
                        <div className="col-md-12 section-heading text-center">
                            <h2 className="to-animate">Serviços</h2>
                            <div className="row">
                                <div className="col-md-8 col-md-offset-2 subtext to-animate">
                                    <h3>Serviços utilizados na criação do projeto</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 col-sm-6 fh5co-service to-animate">
                            <i className="icon to-animate-2">
                                <figure><img src={logo_react} style={{width: 100, height: 100}} alt="Image"/></figure>
                            </i>
                            <h3>Aplicação Web</h3>
                            <p>Foi utilizado <strong>React</strong> para o desenvolvimento da aplicação web </p>
                        </div>
                        <div class="clearfix visible-sm-block"></div>
                        <div class="col-md-6 col-sm-6 fh5co-service to-animate">
                            <i className="icon to-animate-2">
                                <figure><img src={logo_firebase} style={{width: 100, height: 100}} alt="Image"/></figure>
                            </i>
                            <h3>API e Base de dados</h3>
                            <p>Para a API e base de dados do projeto foram utilizadas as <strong>Cloud Functions</strong> e <strong>Cloud Firestore</strong> da plataforma <strong>Firebase</strong></p>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
}

export default Services;
