<?php
namespace WebIDE\SiteBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use WebIDE\SiteBundle\Entity\ProjectVersion;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use WebIDE\SiteBundle\Entity\File;
use Symfony\Component\HttpFoundation\Request;
use WebIDE\SiteBundle\Entity\Project;
use FOS\RestBundle\View\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use JMS\SecurityExtraBundle\Annotation\Secure;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class ProjectController extends Controller
{
    public function getProjectsAction()
    {
        if (false === $this->get('security.context')->isGranted('ROLE_USER')) {
            throw new HttpException(503);
        }

        $em = $this->getDoctrine()->getManager();
        $query = $em->createQuery("SELECT p, f FROM WebIDESiteBundle:Project p JOIN p.files f JOIN p.version pv JOIN f.version fv WHERE fv.id = pv");

        $projects = $query->getResult();

        $view = View::create()
            ->setStatusCode(200)
            ->setData($projects);

        return $this->get('fos_rest.view_handler')->handle($view);
    }

    /**
     * @Rest\Route("/projects/recent")
     */
    public function getRecentProjectsAction()
    {
        if (false === $this->get('security.context')->isGranted('ROLE_USER')) {
            throw new HttpException(503);
        }

        $em = $this->getDoctrine()->getManager();
        $query = $em->createQuery("SELECT p FROM WebIDESiteBundle:Project p ORDER BY p.updated DESC");
        $query->setMaxResults(5);

        $projects = $query->execute();

        $view = View::create()
            ->setStatusCode(200)
            ->setData($projects);

        return $this->get('fos_rest.view_handler')->handle($view);
    }

    public function getProjectAction($id)
    {
        if (false === $this->get('security.context')->isGranted('ROLE_USER')) {
            throw new HttpException(503);
        }

        $em = $this->getDoctrine()->getManager();
        $query = $em->createQuery("SELECT p, f FROM WebIDESiteBundle:Project p LEFT JOIN p.files f LEFT JOIN p.version pv LEFT JOIN f.version fv WITH fv.id = pv WHERE p.id = :id ");
        $query->setParameter("id", $id);

        $project = $query->getResult();

        if (!$project || !isset($project[0])) {
            throw $this->createNotFoundException('Project not found.');
        }

        $project = $project[0];

        $project->setCurrentVersion($project->getVersion()->getId());

        $view = View::create()
            ->setStatusCode(200)
            ->setData($project);

        return $this->get('fos_rest.view_handler')->handle($view);
    }


    /**
     * @Rest\Get("/projects/{id}/{version}")
     */
    public function getProjectVersionAction($id, $version)
    {
        if (false === $this->get('security.context')->isGranted('ROLE_USER')) {
            throw new HttpException(503);
        }

        $em = $this->getDoctrine()->getManager();
        $query = $em->createQuery("SELECT p, f FROM WebIDESiteBundle:Project p LEFT JOIN p.files f LEFT JOIN p.version pv LEFT JOIN f.version fv WITH fv.id = :version WHERE p.id = :id ");
        $query->setParameter("id", $id);
        $query->setParameter("version", $version);

        $query->execute();
        $project = $query->getResult();

        if (!$project || !isset($project[0])) {
            throw $this->createNotFoundException('Project not found.');
        }

        $project = $project[0];

        $project->setCurrentVersion($version);

        $view = View::create()
            ->setStatusCode(200)
            ->setData($project);

        return $this->get('fos_rest.view_handler')->handle($view);
    }


    /**
     * @Rest\Post("/projects/{id}/version")
     */
    public function newProjectVersionAction($id)
    {
        if (false === $this->get('security.context')->isGranted('ROLE_USER')) {
            throw new HttpException(503);
        }

        $em = $this->getDoctrine()->getManager();
        $query = $em->createQuery("SELECT p, f FROM WebIDESiteBundle:Project p LEFT JOIN p.files f LEFT JOIN p.version pv LEFT JOIN f.version fv WITH fv.id = pv WHERE p.id = :id ");
        $query->setParameter("id", $id);

        $project = $query->getResult();

        if (!$project || !isset($project[0])) {
            throw $this->createNotFoundException('Project not found.');
        }

        $project = $project[0];

        $version = new ProjectVersion();
        $version->setName($project->getVersion()->getName() + 1);
        $project->setVersion($version);

        $newFiles = array();

        /**
         * @var File $file
         */
        foreach($project->getFiles() as $file) {
            $newFile = new File();

            $newFile->setActive($file->isActive());
            $newFile->setSelected($file->isSelected());
            $newFile->setResource($file->isResource());
            $newFile->setOrder($file->getOrder());
            $newFile->setType($file->getType());
            $newFile->setName($file->getName());
            $newFile->setContent($file->getContent());
            $newFile->setProject($project);
            $newFile->setVersion($version);

            $newFiles[] = $newFile;
        }

        $project->setFiles($newFiles);

        $em->getManager()->persist($project);
        $em->getManager()->flush();

        $project->setCurrentVersion($project->getVersion()->getId());

        $view = View::create()
            ->setStatusCode(200)
            ->setData($project);

        return $this->get('fos_rest.view_handler')->handle($view);
    }

    /**
     * @Rest\Get
     * @Route("/projects/{id}/download")
     */
    public function downloadProjectAction($id)
    {
        if (false === $this->get('security.context')->isGranted('ROLE_USER')) {
            throw new HttpException(503);
        }

        $em = $this->getDoctrine()->getManager();
        $query = $em->createQuery("SELECT p, f FROM WebIDESiteBundle:Project p LEFT JOIN p.files f LEFT JOIN p.version pv LEFT JOIN f.version fv WITH fv.id = pv WHERE p.id = :id ");
        $query->setParameter("id", $id);

        $project = $query->getResult();

        if (!$project || !isset($project[0])) {
            throw $this->createNotFoundException('Project not found.');
        }

        $file = "/home/daniel/download.zip";

        $headers = array(
            'Content-Description'        => 'File Transfer',
            'Content-Disposition'        => 'inline; attachment; filename=' . basename($file),
            'Content-Type'               => 'application/zip',
            'Content-Transfer-Encoding:' => 'binary',
        );

        return new Response(file_get_contents($file), 200, $headers);
    }

    public function postProjectsAction()
    {
        if (false === $this->get('security.context')->isGranted('ROLE_USER')) {
            throw new HttpException(503);
        }

        $em = $this->getDoctrine()->getManager();

        $project = new Project();
        $project = $this->createProjectFromRequest($project);

        //TODO: Add validation

        $em->persist($project);
        $em->flush();

        $project->setCurrentVersion($project->getVersion()->getId());

        $view = View::create()
            ->setStatusCode(200)
            ->setData($project);

        return $this->get('fos_rest.view_handler')->handle($view);
    }

    public function putProjectAction($id)
    {
        if (false === $this->get('security.context')->isGranted('ROLE_USER')) {
            throw new HttpException(503);
        }

        $em = $this->getDoctrine()->getManager();
        $query = $em->createQuery("SELECT p, f FROM WebIDESiteBundle:Project p LEFT JOIN p.files f LEFT JOIN p.version pv LEFT JOIN f.version fv WITH fv.id = pv WHERE p.id = :id ");
        $query->setParameter("id", $id);

        $project = $query->getResult();

        if (!$project || !isset($project[0])) {
            throw $this->createNotFoundException('Project not found.');
        }

        $project = $project[0];
        $project = $this->createProjectFromRequest($project);

        //TODO: Add validation

        $em->persist($project);
        $em->flush();

        $project->setCurrentVersion($project->getVersion()->getId());

        $view = View::create()
            ->setStatusCode(200)
            ->setData($project);

        return $this->get('fos_rest.view_handler')->handle($view);
    }

    public function deleteProjectAction($id)
    {
        if (false === $this->get('security.context')->isGranted('ROLE_USER')) {
            throw new HttpException(503);
        }

        $em = $this->getDoctrine()->getManager();
        $query = $em->createQuery("SELECT p, f FROM WebIDESiteBundle:Project p LEFT JOIN p.files f LEFT JOIN p.version pv LEFT JOIN f.version fv WITH fv.id = pv WHERE p.id = :id ");
        $query->setParameter("id", $id);

        $project = $query->getResult();

        if (!$project || !isset($project[0])) {
            throw $this->createNotFoundException('Project not found.');
        }

        $project = $project[0];

        $em->remove($project);
        $em->flush();

        $view = View::create()
            ->setStatusCode(200);

        return $this->get('fos_rest.view_handler')->handle($view);
    }

    protected function createProjectFromRequest(Project $project)
    {
        if (false === $this->get('security.context')->isGranted('ROLE_USER')) {
            throw new HttpException(503);
        }

        $em = $this->getDoctrine()->getManager();
        $request = $this->getRequest();
        $newVersion = false;

        if(!$project->getVersion()) {
            $project->setVersion(new ProjectVersion());
        } else {
            $versionRequest = $request->get("current_version", $project->getVersion()->getId());

            if ($project->getVersion()->getId() !== $versionRequest) {
                $version = new ProjectVersion();
                $version->setName($project->getVersion()->getName() + 1);
                $project->setVersion($version);

                $newVersion = true;
            }
        }

        //Init hash
        $hash = hash_init("md5");

        //Create files
        $files = array();
        foreach ($request->get('files', array()) as $fileData) {
            if(is_array($fileData)) {
                if($newVersion) {
                    $file = new File();
                } elseif(isset($fileData['id'])) {
                    $file = $this->getDoctrine()->getRepository("WebIDESiteBundle:File")->find(array('id' => $fileData['id']));
                    if(!$file) {
                        $file = new File();
                    }
                } else {
                    $file = new File();
                }

                $file->setActive($fileData['active']);
                $file->setSelected($fileData['selected']);
                $file->setResource($fileData['resource']);
                $file->setOrder($fileData['order']);
                $file->setType($fileData['type']);
                $file->setName($fileData['name']);
                $file->setContent($fileData['content']);
                $file->setProject($project);
                $file->setVersion($project->getVersion());
            } else {
                $file = $this->getDoctrine()->getRepository("WebIDESiteBundle:File")->find(array('id' => $fileData));
            }

            $files[] = $file;

            //Update hash
            hash_update($hash, $file->getContent());
            $em->persist($file);
        }

        $project->setHash(hash_final($hash));

        return $project;
    }
}