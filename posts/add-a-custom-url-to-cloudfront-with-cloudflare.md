---
draft: false
date: 2023-02-28
layout: layouts/post.njk
title: 'Add a custom domain to CloudFront with Cloudflare'
description: Configuring DNS and SSL certificates in AWS to play nicely.
tags:
- dns

---
After trying and failing to get this to work several times I thought I'd record the particular setup that worked for me. The main thing I've learned is that there are a lot of moving parts and layers of caching so sometimes it just takes some patience. Now I've finally succeeded, I intend to apply this to several sites mainly to decouple myself from the default AWS CloudFront domain.

With some of the sites I look after, static assets such as images are stored in an S3 bucket and I've set up CloudFront as a CDN, but I want my assets served from a nice domain name that I control, rather than the default one supplied by CloudFront.

## Pick a domain for the CDN
Pick the domain you want to use. Ideally, you should use a subdomain of the site's primary domain. If there are some access issues with managing the DNS of the site's primary domain, then you may want to reserve another generic domain for this purpose. Using the same top-level domain might help you operate a stricter CORS setup if you need it. A prefix like `cdn.` is a sensible option. For this post, let's assume it's `cdn.project.tld`.

## Set up a new SSL certificate in ACM
Assuming that you already have an S3 bucket set up and are using CloudFront, then the next step is to create a custom SSL certificate with AWS Certificate Manager (ACM). You can access this via the AWS console. There are a couple of things that I read were important to keep in mind when setting this up. Regardless of which region your bucket is located in, the SSL certificate should be located in the `us-east-1` region.

In ACM choose to request a certificate. The Certificate type should be set to 'Public', and use the domain you picked earlier, eg. `cdn.project.tld`. Use the DNS validation method so the certificate can auto-renew, and pick the default/recommended 'Key algorithm' (I don't know if this matters).

## Validate the CDN via Cloudflare
When you view the new certificate in ACM, it will provide you with a CNAME key-value pair. Log into Cloudflare and create this new DNS record. The CNAME record should _not_ be proxied. Note that the name that you copy from AWS will include the top-level domain, so make sure that you correct that before creating the record on Cloudflare (it's quite long so the end can be obscured in the input field). I like to add a note here in Cloudflare for the record too, something like 'AWS CloudFront SSL Certificate'.

Once you've created the record, check back on ACM and see if the certificate has updated its status from 'Pending' to 'Issued'. It might take some time, but in my experience, it worked pretty much instantly.

## Assign the SSL certificate
Now you can assign the SSL Certificate to your CloudFront distribution, so head over to CloudFront in AWS, and locate the relevant distribution. Edit the General Settings. This is where you can assign the alternate domain name you want to use instead of the default CloudFront-assigned URL. In this case, it's `cdn.project.tld`. Now select the SSL certificate you just created. Choose the recommended Security policy and add the additional supported HTTP versions (I don't see any harm). I keep the logging setting off, and IPv6 on. I also like to add a description eg. _CDN for project.tld_.

## Create the DNS records for the custom domain
In Cloudflare, create the CNAME record for custom CDN domain (in this case `cdn.project.tld`) and set the target as the CloudFront distribution domain that was used previously. It looks something like `abc123.cloudfront.net`. Don't proxy this domain and let CloudFront handle all the caching[^1].

## Test, test again and be patient
To test this, try accessing a CloudFront asset through the new domain e.g. where it might have been `https://abc123.cloudfront.net/image.png`, try `https://cdn.project.tld/image.png`. Again, this could take a few minutes to work, and sometimes it might stop working for a bit, and then work again, so I usually leave it overnight to propagate (48 hours if you really want to feel safe).

If it's still not working, double-check that you haven't set up the last step as a proxied domain. This seems to be the part that takes the longest to resolve if you've made a mistake, so you may need to check back in a few hours. Sometimes when I'm finding DNS records I like to try and [flush the cache of the problem record in Google's public DNS](https://developers.google.com/speed/public-dns/cache). I honestly can't tell whether it makes a difference but sometimes it's just nice to experience the placebo effect from doing it 😉.

[^1]: I'm sure there's a way to set this up which uses CloudFlare to proxy requests to CloudFront or even directly to the S3 bucket. That might be useful particularly if you're serving things like your CSS or JS from S3 and want the benefits of Brotli compression that Cloudflare provides. Cloudflare also gives you a global cache on the free tier, whereas a global cache in CloudFront is more expensive than limiting it to North America and Europe. For my needs it's fine.
