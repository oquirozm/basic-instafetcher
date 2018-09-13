function insertInstagramPosts(data) {
        const instafeedContainer = document.getElementById('instafeed');
        data.forEach(element => {
            let aTag = document.createElement('a');
            let imgTag = document.createElement('img');
            aTag.setAttribute('href', element.link);
            aTag.setAttribute('target', '_blank');
            imgTag.setAttribute('src', element.imgUrl);

            aTag.appendChild(imgTag);
            instafeedContainer.appendChild(aTag);
        });
    }

    async function instagramPhotos() {
        // It will contain our photos' links
        const res = [];

        try {
            // swtiched to fetch api
            const userInfoSource = await fetch(
                'https://www.instagram.com/{{ $username }}/'
            ).then(res => res.text());

            // find the sharedData JSON object with all the data
            const jsonObject = userInfoSource
                .match(
                    /<script type="text\/javascript">window\._sharedData = (.*)<\/script>/
                )[1]
                .slice(0, -1);

            // parse the JSON object
            const userInfo = JSON.parse(jsonObject);

            // Retrieve only the first x results
            const x = 6;
            console.log(userInfo.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges.length);
            const mediaArray = userInfo.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges.splice(
                0,
                x
            );
            // go through the nodes and get the image
            for (let media of mediaArray) {
                const node = media.node;
                let post = {};

                // Process only if is an image
                if (
                    node.__typename &&
                    node.__typename !== 'GraphImage' &&
                    node.__typename === 'GraphSidecar'
                ) {
                    post.imgUrl =
                        node.thumbnail_resources[
                            node.thumbnail_resources.length - 1
                        ].src;
                    post.link = 'https://instagram.com/p/' + node.shortcode;
                    res.push(post);
                    continue;
                }

                // Push the thumbnail src in the array
                post.imgUrl = node.thumbnail_src;
                post.link = 'https://instagram.com/p/' + node.shortcode;
                res.push(post);
            }
        } catch (e) {
            console.error('Unable to retrieve photos. Reason: ' + e.toString());
        }

        return res;
    }

    function ready(fn) {
        if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
            fn();
        } else {
        document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready( function() {
        instagramPhotos().then(res => insertInstagramPosts(res));
    })
