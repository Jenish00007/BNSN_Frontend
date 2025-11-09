import React, { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { getConfiguration } from '../apollo/queries'
import {
  fetchAppConfig,
  getAllAppConfig,
  getAppColors,
  getAppLogo,
  getAppName,
  getHomepageContent,
  getSocialMediaLinks,
  getContactInfo,
  getBanner,
  getAppIcon,
  getAppNameLowerLetter,
  getAppPackageId,
  getSlug,
  getOwner,
  getVersionCode,
  getProjectId,
  getIsActive,
  getCreatedAt,
  getUpdatedAt,
  getAppId,
  getAppType,
  getForceUpdateConfig
} from '../services/configService'

const GETCONFIGURATION = gql`
  ${getConfiguration}
`

const ConfigurationContext = React.createContext({})

export const ConfigurationProvider = (props) => {
  const [appConfig, setAppConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const { loading, data, error } = useQuery(GETCONFIGURATION)

  useEffect(() => {
    const loadAppConfig = async () => {
      try {
        setConfigLoading(true);
        const config = await fetchAppConfig();
        setAppConfig(config);
      } catch (error) {
        console.error('Error loading app configuration:', error);
      } finally {
        setConfigLoading(false);
      }
    };
    loadAppConfig();
  }, []);

  // Create comprehensive configuration object using all configService functions
  const configuration = {
    // GraphQL configuration data
    ...(loading || error || !data.configuration
      ? {
          currency: 'INR',
          currencySymbol: '₹',
          deliveryRate: 0,
          expoClientID:
            '967541328677-d46sl62t52g5r3o5m0mnl2hpptr242nl.apps.googleusercontent.com',
          androidClientID:
            '967541328677-7264tf7tkdtoufk844rck9mimrve135c.apps.googleusercontent.com',
          iOSClientID:
            '967541328677-nf8h4ou7rhmq9fahs87p057rggo95eah.apps.googleusercontent.com'
        }
      : data.configuration),

    // App configuration from API
    ...(appConfig ? getAllAppConfig(appConfig) : {}),

    // Individual getter functions for easy access
    getAppColors: () => getAppColors(appConfig),
    getAppLogo: () => getAppLogo(appConfig),
    getAppName: () => getAppName(appConfig),
    getHomepageContent: () => getHomepageContent(appConfig),
    getSocialMediaLinks: () => getSocialMediaLinks(appConfig),
    getContactInfo: () => getContactInfo(appConfig),
    getBanner: () => getBanner(appConfig),
    getAppIcon: () => getAppIcon(appConfig),
    getAppNameLowerLetter: () => getAppNameLowerLetter(appConfig),
    getAppPackageId: () => getAppPackageId(appConfig),
    getSlug: () => getSlug(appConfig),
    getOwner: () => getOwner(appConfig),
    getVersionCode: () => getVersionCode(appConfig),
    getProjectId: () => getProjectId(appConfig),
    getIsActive: () => getIsActive(appConfig),
    getCreatedAt: () => getCreatedAt(appConfig),
    getUpdatedAt: () => getUpdatedAt(appConfig),
    getAppId: () => getAppId(appConfig),
    getAppType: () => getAppType(appConfig),
    getForceUpdateConfig: () => getForceUpdateConfig(appConfig),
    forceUpdateSettings: getForceUpdateConfig(appConfig),
  }

  return (
    <ConfigurationContext.Provider
      value={{ ...configuration, configLoading }}
    >
      {props.children}
    </ConfigurationContext.Provider>
  )
}

export const ConfigurationConsumer = ConfigurationContext.Consumer
export default ConfigurationContext
