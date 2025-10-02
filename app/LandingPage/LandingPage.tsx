import type { NextPage } from 'next';
import Image from 'next/image';
import styles from './LandingPage.module.css';

const Px: NextPage = () => {
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
          <b className={styles.seeWhatOur}>See what our trusted users Say</b>
          <div className={styles.content3}>
            <div className={styles.client}>
              <div className={styles.comment}>
                <Image className={styles.avater02Icon} width={70} height={70} sizes="100vw" alt="" />
                <div className={styles.allBaseUi}>
                  “If you haven’t tried whitepace yet, you need to give it a shot for your next event. It’s so easy and
                  intuitive to get a new event setup and if you need any help their customer service is seriously
                  amazing.”
                </div>
              </div>
              <div className={styles.nameStar}>
                <div className={styles.name}>
                  <b className={styles.nameSurname}>Jessie Owner</b>
                  <div className={styles.founderAcmeCompan}>Founder, XYZ Company</div>
                </div>
                <div className={styles.btnStar}></div>
              </div>
            </div>
            <div className={styles.client2}>
              <div className={styles.comment}>
                <Image className={styles.avater02Icon} width={70} height={70} sizes="100vw" alt="" />
                <div className={styles.allBaseUi}>
                  “If you haven’t tried whitepace yet, you need to give it a shot for your next event. It’s so easy and
                  intuitive to get a new event setup and if you need any help their customer service is seriously
                  amazing.”
                </div>
              </div>
              <div className={styles.nameStar}>
                <div className={styles.name}>
                  <b className={styles.nameSurname}>Jessie Owner</b>
                  <div className={styles.founderAcmeCompan}>Founder, XYZ Company</div>
                </div>
                <div className={styles.btnStar}></div>
              </div>
            </div>
            <div className={styles.client2}>
              <div className={styles.comment}>
                <Image className={styles.avater02Icon} width={70} height={70} sizes="100vw" alt="" />
                <div className={styles.allBaseUi}>
                  “If you haven’t tried whitepace yet, you need to give it a shot for your next event. It’s so easy and
                  intuitive to get a new event setup and if you need any help their customer service is seriously
                  amazing.”
                </div>
              </div>
              <div className={styles.nameStar}>
                <div className={styles.name}>
                  <b className={styles.nameSurname}>Jessie Owner</b>
                  <div className={styles.founderAcmeCompan}>Founder, XYZ Company</div>
                </div>
                <div className={styles.btnStar}></div>
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
