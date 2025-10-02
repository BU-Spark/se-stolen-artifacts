import type { NextPage } from 'next';
import Image from 'next/image';
import styles from './LandingPage.module.css';

const Px: NextPage = () => {
  const teamMembers = [
    {
      name: 'Ava Chen',
      role: 'Head of Provenance Research',
      image: '/team/ava-chen.svg',
      alt: 'Portrait of Ava Chen',
    },
    {
      name: 'Liam Patel',
      role: 'Machine Learning Lead',
      image: '/team/liam-patel.svg',
      alt: 'Portrait of Liam Patel',
    },
    {
      name: 'Nina Ross',
      role: 'Field Outreach Director',
      image: '/team/nina-ross.svg',
      alt: 'Portrait of Nina Ross',
    },
    {
      name: 'Mateo Ruiz',
      role: 'Cultural Heritage Analyst',
      image: '/team/mateo-ruiz.svg',
      alt: 'Portrait of Mateo Ruiz',
    },
    {
      name: 'Sam Park',
      role: 'Security & Compliance Officer',
      image: '/team/sam-park.svg',
      alt: 'Portrait of Sam Park',
    },
    {
      name: 'Zoe Hendrix',
      role: 'Partnerships Manager',
      image: '/team/zoe-hendrix.svg',
      alt: 'Portrait of Zoe Hendrix',
    },
  ];

  return (
    <div className={styles.landingPageV2Desktop19}>
      <div className={styles.header}>
        <div className={styles.block2}>
          <div className={styles.logo}>
            <b className={styles.whitepace}>Machine Learning for Stolen Artifacts</b>
          </div>
          <div className={styles.menu}>
            <div className={styles.navMenu}>
              <div className={styles.products}>
                <div className={styles.solutions}>About</div>
                <Image src="/Vector.svg" className={styles.vectorIcon} width={9} height={4} sizes="100vw" alt="" />
              </div>
              <div className={styles.products}>
                <div className={styles.solutions}>Team</div>
                <Image src="/Vector.svg" className={styles.vectorIcon} width={9} height={4} sizes="100vw" alt="" />
              </div>
            </div>
            <div className={styles.btn}>
              <div className={styles.btnLogin}>
                <div className={styles.tryWhitepaceFree}>Log In</div>
              </div>
              <div className={styles.btnFreeTrial2}>
                <div className={styles.tryWhitepaceFree}>Sign Up</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.workManagement}>
        <div className={styles.block3}>
          <div className={styles.content}>
            <div className={styles.headline}>
              <div className={styles.textBlock2}>
                <b className={styles.projectManagement}>Project Management</b>
                <div className={styles.imagesVideosPdfs}>
                  Images, videos, PDFs and audio files are supported. Create math expressions and diagrams directly from
                  the app. Take photos with the mobile app and save them to a note.
                </div>
              </div>
            </div>
            <div className={styles.imageContainer2} />
          </div>
          <div className={styles.content2}>
            <Image className={styles.workTogetherImage} width={710} height={661} sizes="100vw" alt="" />
            <div className={styles.headline2}>
              <div className={styles.textBlock2}>
                <b className={styles.projectManagement}>Work together</b>
                <div className={styles.imagesVideosPdfs}>
                  With whitepace, share your notes with your colleagues and collaborate on them. You can also publish a
                  note to the internet and share the URL with others.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.testimonial}>
        <div className={styles.block9}>
          <b className={styles.seeWhatOur}>About</b>
          <div className={styles.content3}>
            <div className={styles.flipCard} tabIndex={0} aria-label="Mission statement">
              <div className={styles.flipCardInner}>
                <div className={styles.flipCardFront}>
                  <Image
                    className={styles.flipCardImage}
                    src="/about/artifact-card.svg"
                    width={240}
                    height={240}
                    sizes="(max-width: 900px) 60vw, 240px"
                    alt="Illustration of artifact scanning"
                  />
                </div>
                <div className={styles.flipCardBack}>
                  <p className={styles.flipCardText}>
                    We bring together historians and technologists to trace stolen artifacts and return them to their
                    rightful communities.
                  </p>
                </div>
              </div>
            </div>
            <div className={styles.flipCard} tabIndex={0} aria-label="Global provenance analysis">
              <div className={styles.flipCardInner}>
                <div className={styles.flipCardFront}>
                  <Image
                    className={styles.flipCardImage}
                    src="/globe.svg"
                    width={240}
                    height={240}
                    sizes="(max-width: 900px) 60vw, 240px"
                    alt="Globe showing our global reach"
                  />
                </div>
                <div className={styles.flipCardBack}>
                  <p className={styles.flipCardText}>
                    Our models analyse provenance records across continents, surfacing leads that help museums verify
                    the the origin of their collections.
                  </p>
                </div>
              </div>
            </div>
            <div className={styles.flipCard} tabIndex={0} aria-label="Investigation workspace">
              <div className={styles.flipCardInner}>
                <div className={styles.flipCardFront}>
                  <Image
                    className={styles.flipCardImage}
                    src="/window.svg"
                    width={240}
                    height={240}
                    sizes="(max-width: 900px) 60vw, 240px"
                    alt="Data dashboard interface"
                  />
                </div>
                <div className={styles.flipCardBack}>
                  <p className={styles.flipCardText}>
                    Investigators rely on our dashboard to triage alerts, collaborate securely, and document successful
                    artifact recoveries.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.yourWork}>
        <div className={styles.heading4}>
          <div className={styles.textBlock6}>
            <b className={styles.projectManagement}>Your work, everywhere you are</b>
            <div className={styles.accessYourNotes}>
              Access your notes from your computer, phone or tablet by synchronising with various services, including
              whitepace, Dropbox and OneDrive. The app is available on Windows, macOS, Linux, Android and iOS. A
              terminal app is also available!
            </div>
          </div>
        </div>
      </div>
      <div className={styles.ourSponsors}>
        <div className={styles.block7}>
          <b className={styles.ourSponsors2}>Our Team</b>
          <div className={styles.teamGrid}>
            {teamMembers.map((member) => (
              <div key={member.name} className={styles.teamMember}>
                <div className={styles.teamPhotoWrapper}>
                  <Image
                    className={styles.teamPhoto}
                    src={member.image}
                    width={160}
                    height={160}
                    sizes="(max-width: 900px) 40vw, 160px"
                    alt={member.alt}
                  />
                </div>
                <b className={styles.teamName}>{member.name}</b>
                <p className={styles.teamRole}>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        <div className={styles.content4}>
          <div className={styles.info}>
            <div className={styles.logoDescription}>
              <div className={styles.whitepaceWasCreated}>
                whitepace was created for the new ways we live and work. We make a better workspace around the world
              </div>
            </div>
            <div className={styles.info2}>
              <b className={styles.product}>Product</b>
              <div className={styles.overview}>Overview</div>
              <div className={styles.blog}>Pricing</div>
              <div className={styles.customerStories}>Customer stories</div>
            </div>
            <div className={styles.info3}>
              <b className={styles.product}>Resources</b>
              <div className={styles.blog}>Blog</div>
              <div className={styles.blog}>{`Guides & tutorials`}</div>
              <div className={styles.helpCenter}>Help center</div>
            </div>
            <div className={styles.info3}>
              <b className={styles.product}>Company</b>
              <div className={styles.blog}>About us</div>
              <div className={styles.blog}>Careers</div>
              <div className={styles.mediaKit}>Media kit</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Px;
