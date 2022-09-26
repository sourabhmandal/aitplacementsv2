import {
  ActionIcon,
  Anchor,
  AppShell,
  Box,
  Burger,
  Button,
  ColorScheme,
  Container,
  createStyles,
  Group,
  Header,
  Menu,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconArrowBarLeft,
  IconBrandGithub,
  IconMoon,
  IconSun,
  IconUser,
} from "@tabler/icons";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { Dispatch, SetStateAction } from "react";
import Logo from "../assets/logo.gif";

const AppContainer: React.FunctionComponent<Props> = ({
  children,
  setTheme,
  theme,
}) => {
  const signedOutlinks: HeaderSimple[] = [
    { link: "/", label: "Home" },
    { link: "/login", label: "Login" },
    { link: "/register", label: "Register" },
  ];

  const { status, data } = useSession();

  const [opened, { toggle }] = useDisclosure(false);
  const headerStyle = useHeaderStyles();
  const footerStyle = useFooterStyles();
  const appshellStyle = useAppShellStyles();
  const router = useRouter();
  const itemsHeader =
    status == "unauthenticated" || status == "loading" ? (
      signedOutlinks.map((l) => (
        <Link key={l.link} href={l.link}>
          <Button
            color="orange"
            variant="subtle"
            className={headerStyle.cx(headerStyle.classes.link, {
              [headerStyle.classes.linkActive]: router.asPath === l.link,
            })}
          >
            {l.label}
          </Button>
        </Link>
      ))
    ) : (
      <Box>
        <Menu shadow="md" width={220}>
          <Menu.Target>
            <Button variant="subtle" color="orange">
              <Box>
                <Text size="xs" weight="bold">
                  {data?.user?.email}
                </Text>
              </Box>
            </Button>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Application</Menu.Label>
            <Menu.Item icon={<IconUser size={14} />}>Profile</Menu.Item>
            <Menu.Divider></Menu.Divider>
            <Menu.Label>Danger</Menu.Label>
            <Menu.Item
              color="red"
              icon={<IconArrowBarLeft size={14} />}
              onClick={async () => {
                await signOut({
                  callbackUrl: "/login",
                  redirect: false,
                });
              }}
            >
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Box>
    );
  const itemsFooter = signedOutlinks.map((link) => (
    <Anchor<"a">
      color="orange"
      key={link.label}
      href={link.link}
      sx={{ lineHeight: 1 }}
      onClick={(event) => event.preventDefault()}
      size="sm"
    >
      {link.label}
    </Anchor>
  ));

  return (
    <AppShell
      classNames={appshellStyle.classes}
      header={
        <Header height={60} mb={120}>
          <Container className={headerStyle.classes.header}>
            <Image src={Logo} alt="ait logo image" width={40} height={35} />
            <Group spacing={5} className={headerStyle.classes.links}>
              {itemsHeader}
              <ActionIcon
                variant="subtle"
                color={"orange"}
                onClick={() => {
                  if (theme == "dark") {
                    setTheme("light");
                  } else {
                    setTheme("dark");
                  }
                }}
              >
                {theme === "dark" ? (
                  <IconMoon size={16} />
                ) : (
                  <IconSun size={16} />
                )}
              </ActionIcon>
            </Group>

            <Burger
              opened={opened}
              onClick={toggle}
              className={headerStyle.classes.burger}
              size="sm"
            />
          </Container>
        </Header>
      }
      footer={
        <div className={footerStyle.classes.footerShell}>
          <div className={footerStyle.classes.footer}>
            <div className={footerStyle.classes.inner}>
              <Image src={Logo} alt="ait logo image" width={40} height={35} />

              <Group className={footerStyle.classes.links}>{itemsFooter}</Group>

              <Group spacing="xs" position="right" noWrap>
                <ActionIcon size="lg" variant="default" radius="xl">
                  <IconBrandGithub size={18} stroke={1.5} />
                </ActionIcon>
              </Group>
            </div>
          </div>
        </div>
      }
      styles={(theme) => ({
        main: {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      })}
    >
      {children}
    </AppShell>
  );
};

export default AppContainer;

const useHeaderStyles = createStyles((theme) => ({
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
  },

  links: {
    [theme.fn.smallerThan("xs")]: {
      display: "none",
    },
  },

  burger: {
    [theme.fn.largerThan("xs")]: {
      display: "none",
    },
  },

  link: {
    display: "block",
    lineHeight: 1,
    padding: "8px 12px",
    borderRadius: theme.radius.sm,
    textDecoration: "none",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },
  },

  linkActive: {
    "&, &:hover": {
      backgroundColor: theme.fn.variant({
        variant: "light",
        color: theme.primaryColor,
      }).background,
      color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
        .color,
    },
  },
}));

const useFooterStyles = createStyles((theme) => ({
  footerShell: {
    bottom: 0,
    width: "100%",
  },
  footer: {
    borderTop: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
  },

  inner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: `${theme.spacing.md}px ${theme.spacing.xs}em`,

    [theme.fn.smallerThan("sm")]: {
      flexDirection: "column",
    },
  },

  links: {
    [theme.fn.smallerThan("sm")]: {
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
  },
}));

const useAppShellStyles = createStyles({
  main: {
    paddingLeft: 0,
    paddingRight: 0,
  },
});

type HeaderSimple = { link: string; label: string };
interface Props {
  theme: string;
  setTheme: Dispatch<SetStateAction<ColorScheme>>;
  children: React.ReactNode;
}
