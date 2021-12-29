export interface DiscordUser {
  id:            string
  username:      string
  avatar:        string
  discriminator: string
  public_flags:  number
  flags:         number
  locale:        string
  mfa_enabled:   boolean
  premium_type:  number
}

// Guides
export interface Guide {
  name:  string
  pages: GuidePage[]
}
export interface GuidePage {
  name:    string
  img?:    string
  desc?:   string
  url?:    string
  credits: string
}
