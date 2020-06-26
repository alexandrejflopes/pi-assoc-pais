import React from 'react';

// import works
import work02 from '../../../assets/home/trello_logo.png';
import work03 from '../../../assets/home/github_logo.png';

function Work() {
    return (
        <div id="work">
            <section id="fh5co-work" data-section="work">
                <div class="container">
                    <div class="row">
                        <div class="col-md-12 section-heading text-center">
                            <h2 class="to-animate">Repositório</h2>
                            <div class="row">
                                <div class="col-md-8 col-md-offset-2 subtext to-animate">
                                    <h3></h3>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row row-bottom-padded-sm">
                        <div class="col-md-4 col-sm-6 col-xxs-12">
                        </div>
                        <div className="col-md-4 col-sm-6 col-xxs-12">
                            <a href="https://github.com/alexandrejflopes/pi-assoc-pais/"
                               className="fh5co-project-item to-animate">
                                <img src={work03} alt="Image" className="img-responsive"/>
                                <div className="fh5co-text">
                                    <h2>Repositório do Projeto</h2>
                                    <span>Link do repositório Github</span>
                                </div>
                            </a>
                        </div>
                        <div class="col-md-2 col-sm-6 col-xxs-12">
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Work;
