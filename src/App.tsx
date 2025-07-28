import { useState, useEffect } from 'react';
import {
  MantineProvider,
  createTheme,
  Container,
  Paper,
  Text,
  Title,
  Button,
  TextInput,
  Loader,
  List,
  Divider,
  Box,
  Alert,
  Anchor,
  Modal,
  rem,
  Flex,
  Stack,
  Card,
  Badge,
  Group,
} from '@mantine/core';
import '@mantine/core/styles.css';

interface TeacherData {
  sourcedId: string;
  givenName: string;
  familyName: string;
  identifier: string;
}

interface ApplicationData {
  LPApplicationId: string;
  Path: string;
  ApplicationName: string;
}

interface DataItem {
  sourcedId: string;
  title: string;
  classSize: number;
  teachers?: TeacherData[];
  orApplications?: ApplicationData[];
}

interface AccessToken {
  token: string;
}

const theme = createTheme({
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  primaryColor: 'dark',
  colors: {
    gray: [
      '#fafafa',
      '#f4f4f5', 
      '#e4e4e7',
      '#d4d4d8',
      '#a1a1aa',
      '#71717a',
      '#52525b',
      '#3f3f46',
      '#27272a',
      '#18181b'
    ]
  },
  components: {
    Container: {
      styles: {
        root: {
          maxWidth: '1200px',
        }
      }
    },
    Button: {
      styles: {
        root: {
          borderRadius: rem(6),
          fontSize: rem(14),
          fontWeight: 500,
          height: rem(36),
          padding: `0 ${rem(16)}`,
          border: '1px solid transparent',
          transition: 'all 0.15s ease',
        },
      },
      variants: {
        filled: () => ({
          root: {
            backgroundColor: '#000',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#262626',
            },
            '&:disabled': {
              backgroundColor: '#e4e4e7',
              color: '#a1a1aa',
            }
          }
        }),
        outline: () => ({
          root: {
            backgroundColor: 'transparent',
            color: '#000',
            borderColor: '#e4e4e7',
            '&:hover': {
              backgroundColor: '#f4f4f5',
              borderColor: '#d4d4d8',
            }
          }
        })
      }
    },
    TextInput: {
      styles: {
        root: {
          marginBottom: rem(16),
        },
        label: {
          fontSize: rem(14),
          fontWeight: 500,
          color: '#18181b',
          marginBottom: rem(6),
        },
        input: {
          borderRadius: rem(6),
          border: '1px solid #e4e4e7',
          backgroundColor: '#fff',
          fontSize: rem(14),
          height: rem(36),
          padding: `0 ${rem(12)}`,
          '&:focus': {
            borderColor: '#000',
            boxShadow: '0 0 0 3px rgba(0,0,0,0.1)',
          },
          '&::placeholder': {
            color: '#a1a1aa',
          }
        },
      },
    },
    Card: {
      styles: {
        root: {
          border: '1px solid #e4e4e7',
          borderRadius: rem(8),
          backgroundColor: '#fff',
          padding: rem(20),
          boxShadow: 'none',
          transition: 'all 0.15s ease',
          '&:hover': {
            borderColor: '#d4d4d8',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }
        }
      }
    },
    Alert: {
      styles: {
        root: {
          borderRadius: rem(6),
          border: '1px solid',
          padding: rem(16),
        },
        title: {
          marginBottom: rem(4),
          fontSize: rem(14),
          fontWeight: 600,
        },
        message: {
          fontSize: rem(14),
        }
      },
      variants: {
        light: () => ({
          root: {
            '&[data-color="red"]': {
              backgroundColor: '#fef2f2',
              borderColor: '#fecaca',
              color: '#dc2626',
            },
            '&[data-color="blue"]': {
              backgroundColor: '#eff6ff',
              borderColor: '#bfdbfe',
              color: '#2563eb',
            },
            '&[data-color="green"]': {
              backgroundColor: '#f0fdf4',
              borderColor: '#bbf7d0',
              color: '#16a34a',
            }
          }
        })
      }
    },
    Modal: {
      styles: {
        header: {
          padding: rem(24),
          borderBottom: '1px solid #e4e4e7',
        },
        title: {
          fontSize: rem(18),
          fontWeight: 600,
          color: '#18181b',
        },
        body: {
          padding: rem(24),
        },
        content: {
          borderRadius: rem(8),
          border: '1px solid #e4e4e7',
        }
      }
    },
    Badge: {
      styles: {
        root: {
          borderRadius: rem(4),
          fontSize: rem(12),
          fontWeight: 500,
          height: rem(20),
          paddingLeft: rem(8),
          paddingRight: rem(8),
        }
      },
      variants: {
        light: () => ({
          root: {
            backgroundColor: '#f4f4f5',
            color: '#52525b',
          }
        })
      }
    }
  },
});

function App() {
  const [input, setInput] = useState<string>('');
  const [tokens, setTokens] = useState<AccessToken | null>(null);
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState<boolean>(false);
  const [modal, setModal] = useState<boolean>(false);

  const proxyUrl = 'https://corsproxy.io/?url=';
  const exchangeUrl = proxyUrl + 'https://applications.apis.classlink.com/exchangeCode';
  const dataUrl = proxyUrl + 'https://myclasses.apis.classlink.com/v1/classes';

  const exchangeCode = async (code: string): Promise<AccessToken> => {
    try {
      const url = `${exchangeUrl}?code=${code}&response_type=code`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Token exchange failed: ${response.statusText} (${response.status})`);
      return await response.json() as AccessToken;
    } catch (error) { throw error; }
  };

  const getData = async (token: string): Promise<DataItem[]> => {
    try {
      const response = await fetch(dataUrl, {headers: {Authorization: `Bearer ${token}`,},});
      if (!response.ok) throw new Error(`Failed to retrieve data: ${response.statusText} (${response.status})`);
      return await response.json() as DataItem[];
    } catch (error) { throw error; }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) { setInput(code); }
    else { setModal(true); setError('No code provided. Please use the userscript and login to classlink, or (advanced) enter it manually in the box.'); }
    setReady(true);
  }, []);

  useEffect(() => {
    const getTokens = async () => {
      if (!ready || !input) { setTokens(null); setData([]); return; };
      setLoading(true); setError(null); setTokens(null);
      try { const result = await exchangeCode(input); setTokens(result); }
      catch (error: unknown) { if (error instanceof Error) setError(error.message || "Unknown error during token exchange."); else setError("Unexpected error during token exchange."); setTokens(null); }
      finally { setLoading(false); }
    };
    getTokens();
  }, [input, ready]);

  useEffect(() => {
    const getItems = async () => {
      if (!tokens || !tokens.token) { setData([]); return; }
      setLoading(true); setError(null); setData([]);
      try { const items = await getData(tokens.token); setData(items); }
      catch (error: unknown) { if (error instanceof Error) setError(error.message || "Unknown error during data retrieval."); else setError("Unexpected error during data retrieval."); setData([]); }
      finally { setLoading(false); }
    };
    getItems();
  }, [tokens]);

  const closeModal = () => { setModal(false); };
  const showModal = () => { setModal(true); };

  return (
    <MantineProvider theme={theme}>
      <Box
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom right, #fafafa, #f4f4f5)',
        }}
      >
        <Container size="md" py={rem(60)}>
          <Stack gap={rem(32)}>
            <Box ta="center">
              <Title 
                order={1} 
                size={rem(48)}
                fw={700}
                style={{ 
                  background: 'linear-gradient(135deg, #000 0%, #52525b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: rem(12)
                }}
              >
                Class Fetch
              </Title>
              <Text size="lg" c="#71717a" maw={rem(500)} mx="auto">
                Retrieve your schedule before official release. 
              </Text>
            </Box>

            <Card maw={rem(480)} mx="auto" w="100%">
              <Stack gap={rem(20)}>
                <TextInput
                  label="OAuth Authorization Code"
                  placeholder="Enter your OAuth code"
                  value={input}
                  onChange={(e) => setInput(e.currentTarget.value)}
                  size="md"
                />

                <Stack gap={rem(12)}>
                  <Button
                    variant="filled"
                    onClick={() => {
                      if (input) {
                        const params = new URLSearchParams(window.location.search);
                        params.set('code', input);
                        window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
                      } else {
                        setError("Please enter an OAuth code.");
                        setModal(true);
                      }
                    }}
                    disabled={loading}
                    fullWidth
                    leftSection={loading ? <Loader size={16} color="white" /> : null}
                  >
                    {loading ? 'Fetching Data...' : 'Fetch Data'}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={showModal}
                    fullWidth
                  >
                    Setup Guide
                  </Button>
                </Stack>
              </Stack>
            </Card>

            {error && (
              <Alert 
                variant="light" 
                color="red" 
                title="Authentication Error"
                maw={rem(600)} 
                mx="auto"
              >
                {error}
                {error.includes("Failed to fetch") && (
                  <Text size="sm" mt="xs" c="dimmed">
                    Ensure API endpoints are accessible.
                  </Text>
                )}
              </Alert>
            )}

            {data.length > 0 && (
              <Box>
                <Group justify="center" mb="xl">
                  <Title order={2} size={rem(24)} fw={600} c="#18181b">
                    Classes Found
                  </Title>
                  <Badge variant="light" size="lg">
                    {data.length} {data.length === 1 ? 'class' : 'classes'}
                  </Badge>
                </Group>

                <Stack gap={rem(16)}>
                  {data.map((item: DataItem) => (
                    <Card key={item.sourcedId}>
                      <Stack gap={rem(16)}>
                        <Group justify="space-between" align="flex-start">
                          <Box flex={1}>
                            <Title order={3} size={rem(18)} fw={600} mb={rem(4)}>
                              {item.title || 'Untitled Class'}
                            </Title>
                            <Group gap={rem(16)}>
                              <Text size="sm" c="#71717a">
                                Class Size: {item.classSize || 'N/A'}
                              </Text>
                              <Text size="sm" c="#71717a">
                                ID: {item.sourcedId}
                              </Text>
                            </Group>
                          </Box>
                        </Group>

                        {item.teachers && item.teachers.length > 0 && (
                          <Box>
                            <Text size="sm" fw={600} mb={rem(8)} c="#18181b">
                              Teachers
                            </Text>
                            <Stack gap={rem(6)}>
                              {item.teachers.map((teacher: TeacherData, index: number) => (
                                <Group key={teacher.sourcedId || index} gap={rem(8)}>
                                  <Text size="sm" c="#52525b">
                                    {teacher.givenName} {teacher.familyName}
                                  </Text>
                                  <Badge variant="light" size="xs">
                                    {teacher.identifier}
                                  </Badge>
                                </Group>
                              ))}
                            </Stack>
                          </Box>
                        )}

                        {item.orApplications && item.orApplications.length > 0 && (
                          <Box>
                            <Text size="sm" fw={600} mb={rem(8)} c="#18181b">
                              Applications
                            </Text>
                            <Stack gap={rem(6)}>
                              {item.orApplications.map((app: ApplicationData, index: number) => (
                                <Group key={app.LPApplicationId || index} gap={rem(8)}>
                                  <Anchor
                                    href={app.Path}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    size="sm"
                                    c="#000"
                                    td="underline"
                                    style={{ textDecorationColor: '#e4e4e7' }}
                                  >
                                    {app.ApplicationName}
                                  </Anchor>
                                </Group>
                              ))}
                            </Stack>
                          </Box>
                        )}
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Box>
            )}

            {!loading && !error && data.length === 0 && input && (
              <Alert variant="light" color="blue" title="No Data Found" maw={rem(600)} mx="auto">
                No classes found. Try reloading with a valid OAuth code.
              </Alert>
            )}

            {!loading && !error && !input && (
              <Alert variant="light" color="blue" title="Setup Required" maw={rem(600)} mx="auto">
                Use the setup guide to configure automatic OAuth code injection.
              </Alert>
            )}
          </Stack>
        </Container>
      </Box>

      <Modal opened={modal} onClose={closeModal} title="OAuth Setup Guide" size="lg" centered>
        <Stack gap={rem(24)}>
          <Text c="#52525b">
            To authenticate with ClassLink, you'll need to set up automatic OAuth code capture using a browser extension.
          </Text>

          <Box>
            <Title order={4} size={rem(16)} fw={600} mb={rem(8)}>
              Step 1: Install Tampermonkey
            </Title>
            <Text size="sm" c="#71717a" mb={rem(12)}>
              Install the browser extension for your platform:
            </Text>
            <Stack gap={rem(8)}>
              <Group>
                <Text size="sm" fw={500}>Chrome:</Text>
                <Anchor 
                  href="https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo" 
                  target="_blank" 
                  size="sm"
                >
                  Chrome Web Store
                </Anchor>
              </Group>
              <Group>
                <Text size="sm" fw={500}>Firefox:</Text>
                <Anchor 
                  href="https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/" 
                  target="_blank" 
                  size="sm"
                >
                  Firefox Add-ons
                </Anchor>
              </Group>
            </Stack>
          </Box>

          <Box>
            <Title order={4} size={rem(16)} fw={600} mb={rem(8)}>
              Step 2: Install UserScript
            </Title>
            <Text size="sm" c="#71717a" mb={rem(12)}>
              Click the link below to install the OAuth capture script:
            </Text>
            <Anchor
              href="https://gist.github.com/Packjackisback/e61476328a660b71eeb56b02a5ad3b1e/raw/f2a09a2d6b602d1627d835b777b300bd0e31ae7d/classfetch.user.js"
              target="_blank"
              fw={500}
            >
              classfetch.user.js
            </Anchor>
          </Box>

          <Box>
            <Title order={4} size={rem(16)} fw={600} mb={rem(8)}>
              Step 3: Authenticate
            </Title>
            <Text size="sm" c="#71717a">
              Navigate to your ClassLink login page and complete the authentication process. 
              The script will automatically capture the OAuth code and redirect you back to this application.
            </Text>
          </Box>

          <Group justify="flex-end" mt={rem(16)}>
            <Button variant="outline" onClick={closeModal}>
              Close
            </Button>
          </Group>
        </Stack>
      </Modal>
    </MantineProvider>
  );
}

export default App;
