import type { NextPage } from 'next';
import Image from 'next/image';
import styles from './LandingPage.module.css';

const Px: NextPage = () => {
  return (
    <div className={styles.landingPageV2Desktop19}>
      <div className={styles.header}>
        <div className={styles.block2}>
          <div className={styles.logo}>
            <div className={styles.logo2}>
              <Image className={styles.logoIcon} width={37} height={29} sizes="100vw" alt="" />
              <b className={styles.whitepace}>whitepace</b>
            </div>
          </div>
          <div className={styles.menu}>
            <div className={styles.navMenu}>
              <div className={styles.products}>
                <div className={styles.solutions}>Products</div>
                <Image src="/Vector.svg" className={styles.vectorIcon} width={9} height={4} sizes="100vw" alt="" />
              </div>
              <div className={styles.products}>
                <div className={styles.solutions}>Solutions</div>
                <Image src="/Vector.svg" className={styles.vectorIcon} width={9} height={4} sizes="100vw" alt="" />
              </div>
              <div className={styles.products}>
                <div className={styles.solutions}>Resources</div>
                <Image src="/Vector.svg" className={styles.vectorIcon} width={9} height={4} sizes="100vw" alt="" />
              </div>
              <div className={styles.products}>
                <div className={styles.solutions}>Pricing</div>
                <Image src="/Vector.svg" className={styles.vectorIcon} width={9} height={4} sizes="100vw" alt="" />
              </div>
            </div>
            <div className={styles.btn}>
              <div className={styles.btnLogin}>
                <div className={styles.tryWhitepaceFree}>Log In</div>
              </div>
              <div className={styles.btnFreeTrial2}>
                <div className={styles.tryWhitepaceFree}>Sign Up</div>
                <Image className={styles.icon} width={10} height={10} sizes="100vw" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.heroSection}>
        <Image className={styles.elementIcon} width={2651.8} height={547} sizes="100vw" alt="" />
        <div className={styles.block}>
          <div className={styles.heading}>
            <div className={styles.textBlock}>
              <b className={styles.getMoreDone}>Get More Done with whitepace</b>
              <div className={styles.projectManagementSoftware}>
                Project management software that enables your teams to collaborate, plan, analyze and manage everyday
                tasks
              </div>
            </div>
            <div className={styles.btnFreeTrial}>
              <div className={styles.tryWhitepaceFree}>Try Whitepace free</div>
              <Image className={styles.btnFreeTrialChild} width={10} height={10} sizes="100vw" alt="" />
            </div>
          </div>
          <div className={styles.imageContainer}>
            <div className={styles.asset12} />
          </div>
        </div>
      </div>
      <div className={styles.workManagement}>
        <div className={styles.block3}>
          <div className={styles.content}>
            <Image className={styles.backgroundIcon} width={602.8} height={448.5} sizes="100vw" alt="" />
            <div className={styles.headline}>
              <div className={styles.textBlock2}>
                <Image className={styles.elementIcon2} width={679.3} height={67.2} sizes="100vw" alt="" />
                <b className={styles.projectManagement}>Project Management</b>
                <div className={styles.imagesVideosPdfs}>
                  Images, videos, PDFs and audio files are supported. Create math expressions and diagrams directly from
                  the app. Take photos with the mobile app and save them to a note.
                </div>
              </div>
              <div className={styles.btnGetStarted}>
                <div className={styles.tryWhitepaceFree}>Get Started</div>
                <Image className={styles.icon2} width={14} height={14} sizes="100vw" alt="" />
              </div>
            </div>
            <div className={styles.imageContainer2} />
          </div>
          <div className={styles.content2}>
            <Image className={styles.workTogetherImage} width={710} height={661} sizes="100vw" alt="" />
            <div className={styles.headline2}>
              <div className={styles.textBlock2}>
                <Image className={styles.elementIcon3} width={298.4} height={28.8} sizes="100vw" alt="" />
                <b className={styles.projectManagement}>Work together</b>
                <div className={styles.imagesVideosPdfs}>
                  With whitepace, share your notes with your colleagues and collaborate on them. You can also publish a
                  note to the internet and share the URL with others.
                </div>
              </div>
              <div className={styles.btnGetStarted}>
                <div className={styles.tryWhitepaceFree}>Try it now</div>
                <Image className={styles.icon2} width={14} height={14} sizes="100vw" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.customiseItToYourNeeds}>
        <div className={styles.block4}>
          <div className={styles.heading2}>
            <div className={styles.textBlock2}>
              <Image className={styles.elementIcon4} width={274} height={28.2} sizes="100vw" alt="" />
              <b className={styles.projectManagement}>
                <p className={styles.customiseItTo}>{`Customise it
to `}</p>
                <p className={styles.customiseItTo}>your needs</p>
              </b>
              <div className={styles.imagesVideosPdfs}>
                Customise the app with plugins, custom themes and multiple text editors (Rich Text or Markdown). Or
                create your own scripts and plugins using the Extension API.
              </div>
            </div>
            <div className={styles.btnGetStarted3}>
              <div className={styles.solutions}>Let’s Go</div>
              <Image className={styles.icon2} width={14} height={14} sizes="100vw" alt="" />
            </div>
          </div>
          <div className={styles.imageContainer}>
            <div className={styles.image} />
          </div>
        </div>
      </div>
      <div className={styles.pricing3}>
        <div className={styles.block5}>
          <div className={styles.heading3}>
            <Image className={styles.elementIcon5} width={318.7} height={30.1} sizes="100vw" alt="" />
            <b className={styles.projectManagement}>Choose Your Plan</b>
            <div className={styles.whetherYouWant}>
              Whether you want to get organized, keep your personal life on track, or boost workplace productivity,
              Evernote has the right plan for you.
            </div>
          </div>
          <div className={styles.priceList}>
            <div className={styles.priceBoard}>
              <div className={styles.textBlock01}>
                <div className={styles.free}>Free</div>
                <b className={styles.b}>$0</b>
                <div className={styles.captureIdeasAnd}>Capture ideas and find them quickly</div>
              </div>
              <div className={styles.bulletPoint}>
                <div className={styles.point}>
                  <Image className={styles.icon5} width={18} height={18} sizes="100vw" alt="" />
                  <div className={styles.syncUnlimitedDevices}>Sync unlimited devices</div>
                </div>
                <div className={styles.point}>
                  <Image className={styles.icon5} width={18} height={18} sizes="100vw" alt="" />
                  <div className={styles.syncUnlimitedDevices}>10 GB monthly uploads</div>
                </div>
                <div className={styles.point}>
                  <Image className={styles.icon5} width={18} height={18} sizes="100vw" alt="" />
                  <div className={styles.syncUnlimitedDevices}>200 MB max. note size</div>
                </div>
                <div className={styles.point}>
                  <Image className={styles.icon5} width={18} height={18} sizes="100vw" alt="" />
                  <div className={styles.syncUnlimitedDevices}>Customize Home dashboard and access extra widgets</div>
                </div>
                <div className={styles.point}>
                  <Image className={styles.icon5} width={18} height={18} sizes="100vw" alt="" />
                  <div className={styles.syncUnlimitedDevices}>Connect primary Google Calendar account</div>
                </div>
                <div className={styles.point}>
                  <Image className={styles.icon5} width={18} height={18} sizes="100vw" alt="" />
                  <div
                    className={styles.syncUnlimitedDevices}
                  >{`Add due dates, reminders, and notifications to your tasks
 `}</div>
                </div>
              </div>
              <div className={styles.btnGetStarted4}>
                <div className={styles.getStarted2}>Get Started</div>
              </div>
            </div>
            <div className={styles.priceBoard2}>
              <div className={styles.textBlock5}>
                <div className={styles.free}>Personal</div>
                <b className={styles.b}>$11.99</b>
                <div className={styles.captureIdeasAnd}>Keep home and family on track</div>
              </div>
              <div className={styles.bulletPoint2}>
                <div className={styles.point}>
                  <Image className={styles.icon5} width={18} height={18} sizes="100vw" alt="" />
                  <div className={styles.syncUnlimitedDevices2}>Sync unlimited devices</div>
                </div>
                <div className={styles.point}>
                  <Image className={styles.icon5} width={18} height={18} sizes="100vw" alt="" />
                  <div className={styles.syncUnlimitedDevices2}>10 GB monthly uploads</div>
                </div>
                <div className={styles.point}>
                  <Image className={styles.icon5} width={18} height={18} sizes="100vw" alt="" />
                  <div className={styles.syncUnlimitedDevices2}>200 MB max. note size</div>
                </div>
                <div className={styles.point}>
                  <Image className={styles.icon5} width={18} height={18} sizes="100vw" alt="" />
                  <div className={styles.syncUnlimitedDevices2}>Customize Home dashboard and access extra widgets</div>
                </div>
                <div className={styles.point}>
                  <Image className={styles.icon5} width={18} height={18} sizes="100vw" alt="" />
                  <div className={styles.syncUnlimitedDevices2}>Connect primary Google Calendar account</div>
                </div>
                <div className={styles.point}>
                  <Image className={styles.icon5} width={18} height={18} sizes="100vw" alt="" />
                  <div
                    className={styles.syncUnlimitedDevices2}
                  >{`Add due dates, reminders, and notifications to your tasks`}</div>
                </div>
              </div>
              <div className={styles.btnGetStarted5}>
                <div className={styles.getStarted2}>Get Started</div>
              </div>
            </div>
            <div className={styles.priceBoard}>
              <div className={styles.textBlock01}>
                <div className={styles.free}>Organization</div>
                <b className={styles.b}>$49.99</b>
                <div className={styles.captureIdeasAnd}>Capture ideas and find them quickly</div>
              </div>
              <div className={styles.bulletPoint}>
                <div className={styles.point}>
                  <Image className={styles.icon5} width={18} height={18} sizes="100vw" alt="" />
                  <div className={styles.syncUnlimitedDevices}>Sync unlimited devices</div>
                </div>
                <div className={styles.point}>
                  <Image className={styles.icon5} width={18} height={18} sizes="100vw" alt="" />
                  <div className={styles.syncUnlimitedDevices}>10 GB monthly uploads</div>
                </div>
                <div className={styles.point}>
                  <Image className={styles.icon5} width={18} height={18} sizes="100vw" alt="" />
                  <div className={styles.syncUnlimitedDevices}>200 MB max. note size</div>
                </div>
                <div className={styles.point}>
                  <Image className={styles.icon5} width={18} height={18} sizes="100vw" alt="" />
                  <div className={styles.syncUnlimitedDevices}>Customize Home dashboard and access extra widgets</div>
                </div>
                <div className={styles.point}>
                  <Image className={styles.icon5} width={18} height={18} sizes="100vw" alt="" />
                  <div className={styles.syncUnlimitedDevices}>Connect primary Google Calendar account</div>
                </div>
                <div className={styles.point}>
                  <Image className={styles.icon5} width={18} height={18} sizes="100vw" alt="" />
                  <div
                    className={styles.syncUnlimitedDevices}
                  >{`Add due dates, reminders, and notifications to your tasks
 `}</div>
                </div>
              </div>
              <div className={styles.btnGetStarted4}>
                <div className={styles.getStarted2}>Get Started</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.yourWork}>
        <div className={styles.heading4}>
          <div className={styles.textBlock6}>
            <Image className={styles.elementIcon6} width={314} height={24} sizes="100vw" alt="" />
            <b className={styles.projectManagement}>Your work, everywhere you are</b>
            <div className={styles.accessYourNotes}>
              Access your notes from your computer, phone or tablet by synchronising with various services, including
              whitepace, Dropbox and OneDrive. The app is available on Windows, macOS, Linux, Android and iOS. A
              terminal app is also available!
            </div>
          </div>
          <div className={styles.btnTry}>
            <div className={styles.wrapperBackground}>
              <Image className={styles.backgroundIcon2} width={844} height={836.5} sizes="100vw" alt="" />
            </div>
            <div className={styles.tryTaskey}>Try Taskey</div>
            <Image className={styles.icon23} width={14} height={14} sizes="100vw" alt="" />
          </div>
        </div>
      </div>
      <div className={styles.yourData}>
        <div className={styles.block6}>
          <div className={styles.heading5}>
            <div className={styles.textBlock2}>
              <Image className={styles.elementIcon7} width={328} height={36.6} sizes="100vw" alt="" />
              <b className={styles.projectManagement}>100% your data</b>
              <div className={styles.imagesVideosPdfs}>
                The app is open source and your notes are saved to an open format, so you&#39;ll always have access to
                Uses End-To-End Encryption (E2EE) to secure your notes and ensure no-one but yourself can access them.
              </div>
            </div>
            <div className={styles.btnTry2}>
              <div className={styles.solutions}>Read more</div>
              <Image className={styles.icon2} width={14} height={14} sizes="100vw" alt="" />
            </div>
          </div>
          <div className={styles.wrapperElement}>
            <Image className={styles.elementIcon8} width={681} height={381.1} sizes="100vw" alt="" />
          </div>
        </div>
      </div>
      <div className={styles.ourSponsors}>
        <Image className={styles.elementIcon9} width={328} height={42.5} sizes="100vw" alt="" />
        <div className={styles.block7}>
          <b className={styles.ourSponsors2}>Our sponsors</b>
          <div className={styles.sponsors}>
            <Image className={styles.appleIcon} width={55.5} height={68} sizes="100vw" alt="" />
            <Image className={styles.microsoftIcon} width={287} height={62} sizes="100vw" alt="" />
            <Image className={styles.slackIcon} width={280} height={71} sizes="100vw" alt="" />
            <Image className={styles.googleIcon} width={211} height={69.8} sizes="100vw" alt="" />
          </div>
        </div>
      </div>
      <div className={styles.apps}>
        <Image className={styles.elementIcon10} width={2041.1} height={700.4} sizes="100vw" alt="" />
        <div className={styles.block8}>
          <Image className={styles.appsIcon} width={582} height={470.8} sizes="100vw" alt="" />
          <div className={styles.heading6}>
            <div className={styles.textBlock}>
              <b className={styles.getMoreDone}>Work with Your Favorite Apps Using whitepace</b>
              <div className={styles.projectManagementSoftware}>
                Whitepace teams up with your favorite software. Integrate with over 1000+ apps with Zapier to have all
                the tools you need for your project success.
              </div>
            </div>
            <div className={styles.btnTry3}>
              <div className={styles.tryWhitepaceFree}>Read more</div>
              <Image className={styles.icon2} width={14} height={14} sizes="100vw" alt="" />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.testimonial}>
        <Image className={styles.elementIcon11} width={258.1} height={49.9} sizes="100vw" alt="" />
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
                <div className={styles.btnStar}>
                  <Image className={styles.btnStarChild} width={15} height={15} sizes="100vw" alt="" />
                  <Image className={styles.btnStarChild} width={15} height={15} sizes="100vw" alt="" />
                  <Image className={styles.btnStarChild} width={15} height={15} sizes="100vw" alt="" />
                  <Image className={styles.btnStarChild} width={15} height={15} sizes="100vw" alt="" />
                  <Image className={styles.btnStarChild} width={15} height={15} sizes="100vw" alt="" />
                </div>
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
                <div className={styles.btnStar}>
                  <Image className={styles.btnStarChild} width={15} height={15} sizes="100vw" alt="" />
                  <Image className={styles.btnStarChild} width={15} height={15} sizes="100vw" alt="" />
                  <Image className={styles.btnStarChild} width={15} height={15} sizes="100vw" alt="" />
                  <Image className={styles.btnStarChild} width={15} height={15} sizes="100vw" alt="" />
                  <Image className={styles.btnStarChild} width={15} height={15} sizes="100vw" alt="" />
                </div>
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
                <div className={styles.btnStar}>
                  <Image className={styles.btnStarChild} width={15} height={15} sizes="100vw" alt="" />
                  <Image className={styles.btnStarChild} width={15} height={15} sizes="100vw" alt="" />
                  <Image className={styles.btnStarChild} width={15} height={15} sizes="100vw" alt="" />
                  <Image className={styles.btnStarChild} width={15} height={15} sizes="100vw" alt="" />
                  <Image className={styles.btnStarChild} width={15} height={15} sizes="100vw" alt="" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.slider}>
          <div className={styles.wrapperLeftArrow}>
            <Image className={styles.leftArrowIcon} width={75} height={75} sizes="100vw" alt="" />
          </div>
          <div className={styles.wrapperLeftArrow}>
            <Image className={styles.leftArrowIcon} width={75} height={75} sizes="100vw" alt="" />
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        <div className={styles.content4}>
          <div className={styles.info}>
            <div className={styles.logoDescription}>
              <div className={styles.logo2}>
                <Image className={styles.logoIcon} width={37} height={29} sizes="100vw" alt="" />
                <b className={styles.whitepace}>whitepace</b>
              </div>
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
            <div className={styles.tryBtn}>
              <b className={styles.tryItToday}>Try It Today</b>
              <div className={styles.getStartedFor}>Get started for free. Add your whole team as your needs grow.</div>
              <div className={styles.btnTry4}>
                <div className={styles.blog}>Start today</div>
                <Image className={styles.icon2} width={14} height={14} sizes="100vw" alt="" />
              </div>
            </div>
          </div>
          <div className={styles.btm}>
            <div className={styles.temsAndCondition}>
              <div className={styles.language}>
                <Image className={styles.icon27} width={19} height={19} sizes="100vw" alt="" />
                <div className={styles.blog}>English</div>
                <Image className={styles.arrowIcon} width={20} height={14} sizes="100vw" alt="" />
              </div>
              <div className={styles.blog}>{`Terms & privacy`}</div>
              <div className={styles.blog}>Security</div>
              <div className={styles.blog}>Status</div>
              <div className={styles.blog}>©2021 Whitepace LLC.</div>
            </div>
            <div className={styles.socialIcon}>
              <Image className={styles.x301FacebookIcon} width={9} height={16.7} sizes="100vw" alt="" />
              <Image className={styles.twitterIcon} width={17} height={13.8} sizes="100vw" alt="" />
              <Image className={styles.btnStarChild} width={15} height={15} sizes="100vw" alt="" />
            </div>
          </div>
          <div className={styles.contentChild} />
        </div>
      </div>
    </div>
  );
};

export default Px;
