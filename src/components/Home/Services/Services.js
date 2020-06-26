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
                            <h2 className="to-animate">Funcionalidades</h2>
                            <div className="row">
                                <div className="col-md-8 col-md-offset-2 subtext to-animate">
                                    <h3>Funcionalidades da plataforma</h3>
                                </div>
                                <div className="row row-bottom-padded-lg">
                                    <div className="col-md-12" style={{marginTop: "100px", textAlign: "center"}}>
                                        <iframe width="800" height="480"
                                                src="https://www.youtube.com/embed/bipmQ-HEFT8">
                                        </iframe>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 col-sm-6 fh5co-service to-animate">
                            <h3><i className="fab fa-osi"></i> Open Source</h3>
                            <p>Solucação completamente grátis e open source. Coloca a tua associação online sem qualquer custo!</p>
                        </div>
                        <div class="col-md-6 col-sm-6 fh5co-service to-animate">
                            <h3><i className="fh5co-intro-icon fas fa-cogs"></i> Solução Configurável</h3>
                            <p>Uma solucação genérica fácilmente configurável que permite satisfazer as necessidades de associações de qualquer tipo de ensino. Escolhe o titulo do teu website , logótipo da associação e vários outros parâmetros para melhor costumizares a tua plataforma!</p>
                        </div>
                        <div className="col-md-12 col-sm-6"></div>

                        <div className="col-md-6 col-sm-6 fh5co-service to-animate">
                            <h3><i className="fh5co-intro-icon fas fa-tasks"></i> Gestão de casos de crianças</h3>
                            <p>Publicação de casos públicos ou privados, comentários e anexo de ficheiros. Uma forma fácil e eficiente para abordar tópicos ou problemas relacionados com as crianças!</p>
                        </div>
                        <div className="col-md-6 col-sm-6 fh5co-service to-animate">
                            <h3><i className="fh5co-intro-icon fas fa-money-bill-wave-alt"></i> Registo de pagamentos</h3>
                            <p>Tracking de pagamentos de cotas. Lista de todos os pagamentos de cada membro e confirmação dos mesmos.</p>
                        </div>
                        <div className="col-md-12 col-sm-6"></div>
                        <div className="col-md-6 col-sm-6 fh5co-service to-animate">
                            <h3><i className="fh5co-intro-icon fas fa-tasks"></i> Gestão de cargos</h3>
                            <p>Atribui cargos a utilizadores com facilidade de transição de cargos entre membros.</p>
                        </div>
                        <div className="col-md-6 col-sm-6 fh5co-service to-animate">
                            <h3><i className="fh5co-intro-icon fas fa-file-export"></i> Exportar Dados</h3>
                            <p>Exporta dados relacionados com pagamentos, membros ou casos. Podes sair da plataforma a qualquer altura e não perder os dados criados na plataforma.</p>
                        </div>
                        <div className="col-md-12 col-sm-6"></div>
                        <div className="col-md-6 col-sm-6 fh5co-service to-animate">
                            <h3><i className="fh5co-intro-icon fas fa-book"></i> Manual de Instruções </h3>
                            <p>Documentação do processo de instalação e o uso do software necessário. Segue todos os passos indicados para colocar a tua plataforma online! </p>
                        </div>


                    </div>
                </div>
            </section>
        </div>
    );
}

export default Services;
