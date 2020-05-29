import React from 'react';

function Intro() {

    return (
        <div id="intro">
            <section id="fh5co-intro">
                <div class="container">
                    <div class="row row-bottom-padded-lg">
                        <div class="fh5co-block to-animate">
                            <div class="overlay-darker"></div>
                            <div class="overlay"></div>
                            <div class="fh5co-text">
                                <i class="fh5co-intro-icon fab fa-osi"></i>
                                <h2>Grátris e open-source</h2>
                                <p>Uma forma completamente grátis de ter uma plataforma online</p>
                            </div>
                        </div>
                        <div class="fh5co-block to-animate" >
                            <div class="overlay-darker"></div>
                            <div class="overlay"></div>
                            <div class="fh5co-text">
                                <i class="fh5co-intro-icon fas fa-cogs"></i>
                                <h2>Solução configurável</h2>
                                <p>Escolhe o título, logo e vários outro parâmetros para melhor costumizares a tua plataforma</p>
                            </div>
                        </div>
                        <div className="fh5co-block to-animate">
                            <div className="overlay-darker"></div>
                            <div className="overlay"></div>
                            <div className="fh5co-text">
                                <i className="fh5co-intro-icon fas fa-tasks"></i>
                                <h2>Gestão de casos de crianças</h2>
                                <p>Cria e comenta casos relacionados com a tua associação</p>
                            </div>
                        </div>
                        <div className="fh5co-block to-animate">
                            <div className="overlay-darker"></div>
                            <div className="overlay"></div>
                            <div className="fh5co-text">
                                <i className="fh5co-intro-icon fas fa-money-bill-wave-alt"></i>
                                <h2>Registos de pagamentos</h2>
                                <p>Uma forma fácil de registar e guardar pagamentos de quotas</p>
                            </div>
                        </div>
                        <div className="fh5co-block to-animate">
                            <div className="overlay-darker"></div>
                            <div className="overlay"></div>
                            <div className="fh5co-text">
                                <i className="fh5co-intro-icon fas fa-file-export"></i>
                                <h2>Exportar data</h2>
                                <p>Possibilidade de exportar data relacionada com pagamentos, casos ou utilizadores</p>
                            </div>
                        </div>
                        <div className="fh5co-block to-animate">
                            <div className="overlay-darker"></div>
                            <div className="overlay"></div>
                            <div className="fh5co-text">
                                <i className="fh5co-intro-icon fas fa-book"></i>
                                <h2>Manual de instruções</h2>
                                <p>Documentação de tudo o que é necessário para iniciar a plataforma</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Intro;
